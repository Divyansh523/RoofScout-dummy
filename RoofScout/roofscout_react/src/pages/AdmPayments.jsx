import { useTheme } from '../hooks/useTheme';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosConfig";
import {
  Menu, Sun, Moon, Home, Building2, Users, UserCheck, CreditCard, Info, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

function AdmPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useTheme();
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rs-theme", theme);
  }, [theme]);

  // Fetch payments (requests with payment_status = 'Paid')
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await API.get("/request");
        
        if (data.success) {
          const paymentsList = data.requests
            .filter(req => req.payment_status === 'Paid')
            .map(req => ({
              id: req._id || req.id,
              payerName: req.applicant_name || req.requester_name || req.name || "Unknown",
              email: req.email || "N/A",
              mobile: req.mobile || "N/A",
              propertyId: req.property_id || req.propertyId,
              amount: req.price || 5000, // Default booking amount
              paymentStatus: req.payment_status,
              requestStatus: req.status || "Pending",
              paymentDate: req.requested_date || req.date || new Date().toISOString().split('T')[0],
              paymentTime: req.requested_time || req.time || "N/A"
            }));
          
          setPayments(paymentsList);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter(payment => 
    payment.payerName.toLowerCase().includes(search.toLowerCase()) ||
    payment.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      {/* TOP NAV */}
      <div className={`sticky top-0 z-50 h-20 flex justify-between items-center px-6 shadow-md ${theme === "dark" ? "bg-gray-800/70" : "bg-white/70 backdrop-blur"}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setCollapsed(c => !c)} className="p-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" alt="RoofScout" />
            <div>
              <h1 className="text-xl font-bold">
                <Link to="/"><span className="text-yellow-500">Roof</span><span className="text-blue-600 dark:text-teal-400">Scout</span></Link>
              </h1>
              <p className="text-sm opacity-70">Admin - Payments</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="p-2 rounded border">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/AdminDashboard" className="px-3 py-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">Dashboard</Link>
        </div>
      </div>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className={`transition-all duration-300 ${collapsed ? "w-20" : "w-72"} bg-gray-900 text-white p-4 min-h-screen`}>
          <nav className="flex flex-col gap-2">
            <SidebarItem to="/AdminDashboard" icon={<Info />} text="Info" collapsed={collapsed} />
            <SidebarItem to="/AdmHouses" icon={<Home />} text="Houses" collapsed={collapsed} />
            <SidebarItem to="/AdmPropt" icon={<Building2 />} text="Properties" collapsed={collapsed} />
            <SidebarItem to="/AdmClients" icon={<Users />} text="Clients" collapsed={collapsed} />
            <SidebarItem to="/AdmTenants" icon={<UserCheck />} text="Tenants" collapsed={collapsed} />
            <SidebarItem to="/AdmPayments" icon={<CreditCard />} text="Payments" collapsed={collapsed} active />
          </nav>
          {!collapsed && (
            <div className="mt-6 text-xs text-gray-300">
              <p className="font-semibold">Quick Stats</p>
              <p>Total Payments: <span className="font-semibold text-white">{payments.length}</span></p>
              <p>Total Amount: <span className="font-semibold text-white">₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span></p>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Payments</h1>
                <p className="text-gray-500 dark:text-gray-300 mt-1">Track all payments made on the platform.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="border px-4 py-2 rounded-lg w-64 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading payments...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No payments found.</div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Payer Name</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Mobile</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Property ID</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Payment Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Request Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment, idx) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{payment.payerName}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payment.email}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payment.mobile}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{payment.propertyId}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">₹{payment.amount?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.requestStatus === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            payment.requestStatus === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            payment.requestStatus === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {payment.requestStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payment.paymentDate}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payment.paymentTime}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ to, icon, text, collapsed, active }) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl text-sm text-gray-100 hover:bg-white/10 transition-all duration-200 ${collapsed ? "justify-center" : ""} ${active ? "bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg shadow-blue-500/30" : ""}`}>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">{icon}</div>
      {!collapsed && <span className="font-medium">{text}</span>}
    </Link>
  );
}

export default AdmPayments;
