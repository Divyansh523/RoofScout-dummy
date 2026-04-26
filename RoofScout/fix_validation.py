import os

def fix_user_profile():
    path = r"c:\Users\HP\Downloads\Be-RoofScout\Be-RoofScout\roofscout_react\src\pages\UserProfile.jsx"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_text = "onChange={e => setFormData({ ...formData, [key]: e.target.value })}"
    new_text = """onChange={e => {
                          let val = e.target.value;
                          if (key === 'phone') {
                            val = val.replace(/\\D/g, '').slice(0, 10);
                          }
                          setFormData({ ...formData, [key]: val });
                        }}"""
    
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed UserProfile.jsx")
    else:
        print("Could not find text in UserProfile.jsx")

def fix_payment():
    path = r"c:\Users\HP\Downloads\Be-RoofScout\Be-RoofScout\roofscout_react\src\pages\Payment.jsx"
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    added_state = False
    added_handler = False
    
    for line in lines:
        # Add state
        if "const [loggedUser, setLoggedUser]" in line and not added_state:
            new_lines.append(line)
            new_lines.append("  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });\n")
            added_state = True
        # Add handler before return
        elif "if (loading) return" in line and not added_handler:
            new_lines.append("""  const handleCardInputChange = (e) => {
    const { id, value } = e.target;
    let val = value;
    if (id === 'cardNumber') {
      val = value.replace(/\\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
      setCardDetails(prev => ({ ...prev, number: val }));
    } else if (id === 'expiry') {
      val = value.replace(/\\D/g, '');
      if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
      setCardDetails(prev => ({ ...prev, expiry: val }));
    } else if (id === 'cvv') {
      val = value.replace(/\\D/g, '').slice(0, 3);
      setCardDetails(prev => ({ ...prev, cvv: val }));
    } else if (id === 'cardName') {
      setCardDetails(prev => ({ ...prev, name: value }));
    }
  };\n\n""")
            new_lines.append(line)
            added_handler = True
        # Replace inputs
        elif 'placeholder="0000 0000 0000 0000"' in line:
             new_lines.append(line.replace('placeholder="0000 0000 0000 0000"', 'id="cardNumber" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={handleCardInputChange}'))
        elif 'placeholder="MM/YY"' in line:
             new_lines.append(line.replace('placeholder="MM/YY"', 'id="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardInputChange}'))
        elif 'placeholder="123"' in line:
             new_lines.append(line.replace('placeholder="123"', 'id="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardInputChange}'))
        elif 'placeholder="John Doe"' in line:
             new_lines.append(line.replace('placeholder="John Doe"', 'id="cardName" placeholder="John Doe" value={cardDetails.name} onChange={handleCardInputChange}'))
        else:
            new_lines.append(line)
            
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed Payment.jsx")

def fix_property_payment():
    path = r"c:\Users\HP\Downloads\Be-RoofScout\Be-RoofScout\roofscout_react\src\pages\PropertyPayment.jsx"
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    added_state = False
    added_handler = False
    
    for line in lines:
        if "const [theme, setTheme] = useTheme();" in line and not added_state:
            new_lines.append(line)
            new_lines.append("    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });\n")
            added_state = True
        elif "if (!propertyData) {" in line and not added_handler:
            new_lines.append("""    const handleCardInputChange = (e) => {
        const { id, value } = e.target;
        let val = value;
        if (id === 'cardNumber') {
            val = value.replace(/\\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
            setCardDetails(prev => ({ ...prev, number: val }));
        } else if (id === 'expiry') {
            val = value.replace(/\\D/g, '');
            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
            setCardDetails(prev => ({ ...prev, expiry: val }));
        } else if (id === 'cvv') {
            val = value.replace(/\\D/g, '').slice(0, 3);
            setCardDetails(prev => ({ ...prev, cvv: val }));
        } else if (id === 'cardName') {
            setCardDetails(prev => ({ ...prev, name: val }));
        }
    };\n\n""")
            new_lines.append(line)
            added_handler = True
        elif 'placeholder="0000 0000 0000 0000"' in line:
             new_lines.append(line.replace('placeholder="0000 0000 0000 0000"', 'id="cardNumber" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={handleCardInputChange}'))
        elif 'placeholder="MM/YY"' in line:
             new_lines.append(line.replace('placeholder="MM/YY"', 'id="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardInputChange}'))
        elif 'placeholder="123"' in line:
             new_lines.append(line.replace('placeholder="123"', 'id="cvc" placeholder="123" value={cardDetails.cvv} onChange={handleCardInputChange}'))
        elif 'placeholder="John Doe"' in line:
             new_lines.append(line.replace('placeholder="John Doe"', 'id="cardName" placeholder="John Doe" value={cardDetails.name} onChange={handleCardInputChange}'))
        else:
            new_lines.append(line)
            
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed PropertyPayment.jsx")

if __name__ == "__main__":
    fix_user_profile()
    fix_payment()
    fix_property_payment()
