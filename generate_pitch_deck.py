import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_restaurant_pitch_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette: Luxury Restaurant Theme
    DARK_BG = RGBColor(11, 14, 23)        # #0B0E17 Deep Charcoal Navy
    CARD_BG = RGBColor(18, 24, 38)        # #121826 Card Surface
    CARD_BORDER = RGBColor(217, 119, 6)   # #D97706 Amber Border
    GOLD = RGBColor(245, 158, 11)         # #F59E0B Bright Gold
    LIGHT_GOLD = RGBColor(253, 230, 138)  # #FDE68A Soft Gold
    WHITE = RGBColor(255, 255, 255)       # White
    GRAY = RGBColor(160, 174, 192)        # Silver Gray
    EMERALD = RGBColor(16, 185, 129)      # Profit Green

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = DARK_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="GARAM MASALA RESTAURANT • SMART AUTOMATION PLATFORM"):
        # Category pill
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = GOLD

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Decorative Border Frame
    frame = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    frame.fill.solid()
    frame.fill.fore_color.rgb = CARD_BG
    frame.line.color.rgb = CARD_BORDER
    frame.line.width = Pt(2)

    # Gold Top Tag
    tag_box = s1.shapes.add_textbox(Inches(1.5), Inches(1.3), Inches(10.33), Inches(0.5))
    tf_tag = tag_box.text_frame
    p_tag = tf_tag.paragraphs[0]
    p_tag.alignment = PP_ALIGN.CENTER
    p_tag.text = "✦ SMART RESTAURANT TRANSFORMATION PITCH ✦"
    p_tag.font.size = Pt(13)
    p_tag.font.bold = True
    p_tag.font.color.rgb = GOLD

    # Main Heading
    h1_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.9), Inches(10.9), Inches(1.8))
    tf_h1 = h1_box.text_frame
    tf_h1.word_wrap = True
    p_h1 = tf_h1.paragraphs[0]
    p_h1.alignment = PP_ALIGN.CENTER
    p_h1.text = "Garam Masala Family Restaurant"
    p_h1.font.size = Pt(38)
    p_h1.font.bold = True
    p_h1.font.color.rgb = WHITE

    p_sub = tf_h1.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.text = "Next-Gen QR Table Ordering, Kitchen Automation & Daily Sales Control"
    p_sub.font.size = Pt(20)
    p_sub.font.bold = True
    p_sub.font.color.rgb = LIGHT_GOLD

    # 3 Highlight Pills on Title Slide
    pills = [
        ("💰 100% Commission-Free", "Zero Swiggy/Zomato commission on dine-in"),
        ("⚡ 25% Faster Table Turnover", "Instant contactless orders direct to kitchen"),
        ("🛡️ Captain 1-Click Verification", "Zero fake orders & complete waste protection")
    ]
    pill_w = Inches(3.4)
    start_x = Inches(1.4)
    y_pos = Inches(4.1)

    for i, (p_title, p_desc) in enumerate(pills):
        px = start_x + (i * Inches(3.6))
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, y_pos, pill_w, Inches(1.3))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(14, 18, 30)
        card.line.color.rgb = GOLD
        card.line.width = Pt(1.5)

        tb = s1.shapes.add_textbox(px, y_pos + Inches(0.1), pill_w, Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.alignment = PP_ALIGN.CENTER
        pt.text = p_title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = GOLD

        pd = tf.add_paragraph()
        pd.alignment = PP_ALIGN.CENTER
        pd.text = p_desc
        pd.font.size = Pt(10)
        pd.font.color.rgb = WHITE

    # Footer on title
    ft = s1.shapes.add_textbox(Inches(1.5), Inches(5.8), Inches(10.33), Inches(0.6))
    p_ft = ft.text_frame.paragraphs[0]
    p_ft.alignment = PP_ALIGN.CENTER
    p_ft.text = "Prepared for Restaurant Owner • Sagar Shakya & Management Team"
    p_ft.font.size = Pt(12)
    p_ft.font.color.rgb = GRAY

    # ==========================================
    # SLIDE 2: THE PROBLEM VS OUR SOLUTION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Traditional Paper Menu Ki Problems vs Smart QR System")

    # Left Column: Old Traditional Way (Red Card)
    c_old = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1))
    c_old.fill.solid()
    c_old.fill.fore_color.rgb = RGBColor(26, 15, 18)
    c_old.line.color.rgb = RGBColor(239, 68, 68)
    c_old.line.width = Pt(1.5)

    tb_old = s2.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.7))
    tf_old = tb_old.text_frame
    tf_old.word_wrap = True
    p1 = tf_old.paragraphs[0]
    p1.text = "❌ Purane Paper Menu Ki Musibatein"
    p1.font.size = Pt(18)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(248, 113, 113)

    old_points = [
        ("Waiter Ke Intezar Me Delay:", "Customer 10-15 minute baitha rehta hai sirf order likhwane ke liye."),
        ("Menu Printing Ka Bada Kharcha:", "Rate ya dish badalne par har baar ₹5,000-₹10,000 ke naye menu print karwao."),
        ("Order Likhne Me Galtiyan:", "Waiter ne Full ki jagah Half likh diya ya mirch ka note bhool gaya - khana barbad!"),
        ("Sold Out Dish Par Gusse Wale Customer:", "Khatam hui dish mangne par 'Nahi hai' bolna padta hai, customer naraz hota hai."),
        ("Daily Hisaab Me Gadbadi:", "Raat ko kacchi parchiyan jodte jodte ghante lagte hain.")
    ]
    for title, desc in old_points:
        pt = tf_old.add_paragraph()
        pt.text = f"• {title} {desc}"
        pt.font.size = Pt(12)
        pt.font.color.rgb = RGBColor(229, 231, 235)

    # Right Column: Our Smart QR Solution (Emerald Card)
    c_new = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.1))
    c_new.fill.solid()
    c_new.fill.fore_color.rgb = RGBColor(13, 30, 24)
    c_new.line.color.rgb = EMERALD
    c_new.line.width = Pt(1.5)

    tb_new = s2.shapes.add_textbox(Inches(7.2), Inches(2.0), Inches(5.0), Inches(4.7))
    tf_new = tb_new.text_frame
    tf_new.word_wrap = True
    p2 = tf_new.paragraphs[0]
    p2.text = "✅ Garam Masala Smart QR Solution"
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = EMERALD

    new_points = [
        ("Instant Table Ordering:", "Table par baithte hi mobile se scan kiya aur 60 second me order direct kitchen screen par!"),
        ("₹0 Zero Re-Printing Cost:", "Nayi dish add karni ho ya rate badalna ho, mobile se 10 second me update ho jata hai."),
        ("100% Sahi Order (Zero Mistake):", "Customer ka exact portion aur special chef note seedha kitchen display par jata hai."),
        ("1-Click In Stock / Sold Out Control:", "Dish khatam hote hi 1 click me sold out mark karo, customer complaint zero!"),
        ("Live Daily Hisaab & Analytics:", "Aaj kitni sale hui, kaun si dish sabse zyada biki - sab 1 click me live dikhta hai.")
    ]
    for title, desc in new_points:
        pt = tf_new.add_paragraph()
        pt.text = f"• {title} {desc}"
        pt.font.size = Pt(12)
        pt.font.color.rgb = RGBColor(209, 250, 229)

    # ==========================================
    # SLIDE 3: 4 BIG PROFIT PILLARS
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Restaurateur Ke Liye 4 Badi Kamai Aur Bachat Ke Raste")

    pillars = [
        ("💰 100% Commission-Free", "Zomato/Swiggy Ko ₹0 Commission", "Dine-in customers ke har order ka 100% paisa aur pura profit seedha aapke gulle me rehta hai. Third party ko 25-30% dena band!"),
        ("📈 15-20% Badi AOV Sale", "Photos & Category Slider Se Zyada Order", "Sundar visual food photos aur 'Chef Special ⭐' dekh kar customer Roti, Chaap, Dal Makhni aur Cold drinks zyada cart me add karta hai."),
        ("⚡ 25% Fast Table Turnover", "Peak Rush Me 2x Zyada Customer", "Waiter ka intezar khatam. Khana jaldi banega, jaldi serve hoga aur peak lunch/dinner time me tables jaldi free hokar naye customer baith sakeinge."),
        ("👥 Kam Staff Me Zyada Tables", "Staff Salary Me Seedhi Bachat", "Pehle har 3-4 table par 1 waiter chahiye hota tha. Ab 2 waiter poore restaurant ki 15-20 tables aasaani se handle kar sakte hain.")
    ]

    for i, (head, sub, desc) in enumerate(pillars):
        x = Inches(0.8 + (i * 2.98))
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(2.8), Inches(5.1))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = GOLD
        card.line.width = Pt(1.5)

        tb = s3.shapes.add_textbox(x + Inches(0.15), Inches(2.0), Inches(2.5), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True

        ph = tf.paragraphs[0]
        ph.text = head
        ph.font.size = Pt(16)
        ph.font.bold = True
        ph.font.color.rgb = GOLD

        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.size = Pt(13)
        ps.font.bold = True
        ps.font.color.rgb = WHITE

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = GRAY

    # ==========================================
    # SLIDE 4: THE BIG PROBLEM SOLVED - FAKE ORDER PROTECTION
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Exclusive Security: 'Captain 1-Click Confirmation' (Fake Orders Se Bachav)")

    # Intro banner
    banner = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.7), Inches(11.7), Inches(1.1))
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(24, 20, 10)
    banner.line.color.rgb = GOLD
    banner.line.width = Pt(1.5)

    tb_b = s4.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(0.9))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    pb1 = tf_b.paragraphs[0]
    pb1.text = "🛡️ Sabse Bada Sawal: 'Agar koi ghar baithkar QR photo se nakli order karega to?'"
    pb1.font.size = Pt(15)
    pb1.font.bold = True
    pb1.font.color.rgb = GOLD
    pb2 = tf_b.add_paragraph()
    pb2.text = "Humne aapke liye 100% Foolproof Captain Verification System banaya hai jisse ₹1 ka bhi raw material waste nahi hoga!"
    pb2.font.size = Pt(12)
    pb2.font.color.rgb = WHITE

    # Step by Step Workflow Cards
    steps = [
        ("Step 1: Customer Places Order", "Customer table par QR scan karke order bhejta hai. Status dikhta hai: 'Table Verification In Progress...'", GOLD),
        ("Step 2: Captain Screen Sound Alert", "Admin/Captain ke mobile/tablet par chime bajti hai aur upar alert aata hai: 'Table 4 Verification Needed'.", GOLD),
        ("Step 3: Waiter Table Verification", "Waiter Table 4 ki taraf dekhta hai: Agar sach me log baithe hain, to wo 1-Click me 'Accept & Send to Kitchen' dabata hai.", EMERALD),
        ("Step 4: Pranksters 1-Click Rejection", "Agar Table 4 khaali hai (kisi ne ghar se prank kiya), waiter 'Reject (Khaali Table)' dabata hai. Khana banega hi nahi, 100% Bachat!", RGBColor(239, 68, 68))
    ]

    for i, (stitle, sdesc, scolor) in enumerate(steps):
        x = Inches(0.8 + (i * 2.98))
        scard = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(3.1), Inches(2.8), Inches(3.8))
        scard.fill.solid()
        scard.fill.fore_color.rgb = CARD_BG
        scard.line.color.rgb = scolor
        scard.line.width = Pt(1.5)

        stb = s4.shapes.add_textbox(x + Inches(0.15), Inches(3.3), Inches(2.5), Inches(3.3))
        stf = stb.text_frame
        stf.word_wrap = True
        pt = stf.paragraphs[0]
        pt.text = stitle
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = scolor

        pd = stf.add_paragraph()
        pd.text = sdesc
        pd.font.size = Pt(11)
        pd.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 5: CUSTOMER EXPERIENCE (NO APP / NO LOGIN)
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Customer Ke Liye 5-Star Experience: Zero App Download, Zero Login")

    cx_points = [
        ("📱 Kisi App Ki Zaroorat Nahi", "Customer ko koi 50MB ka Zomato ya Swiggy app download nahi karna. Camera se scan kiya aur browser me seedha menu khul gaya."),
        ("⚡ No Login, No OTP Hassle", "Phone number ya OTP dalne ka jhanjhat nahi. Customer seedha baith kar instant bina kisi rukawat ke order kar sakta hai."),
        ("🍲 101 Dishes & 10 Categories", "Paneer, Chaap, Chinese, Tandoor, Rolls, Dals, Noodles ka smooth horizontal category slider - ungli se slide karo aur cart me add karo."),
        ("🥣 Full vs Half Portion Clarity", "Menu card ki exact pricing (Full aur Half alag-alag). Customer ko bill aur portion ki 100% transparency milti hai."),
        ("🕒 Live Order Status Tracking", "Screen par live steps dikhte hain: 'Table Verification' ➔ 'Kitchen Me Ban Raha Hai' ➔ 'Table Par Serve Hua' ➔ 'Order Complete'."),
        ("💬 Chef Special Request Box", "Customer dish ke sath note likh sakta hai: 'Less spicy', 'Extra crispy roti', 'Pehle cold drinks lana' - seedha kitchen tak.")
    ]

    for i, (title, desc) in enumerate(cx_points):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + (col * 5.9))
        y = Inches(1.8 + (row * 1.7))

        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(1.5))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = GOLD
        card.line.width = Pt(1)

        tb = s5.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(5.2), Inches(1.2))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = GOLD

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 6: KITCHEN DISPLAY SYSTEM (KDS) & STAFF CONTROL
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Kitchen Display System (KDS) & Waiter Management")

    kds_cards = [
        ("🔔 Real-Time Sound & Visual Alerts", "Jaise hi naya order aata hai, kitchen/counter par audio chime bajti hai aur Table number screen par highlight hota hai. Koi order miss hone ka chance hi nahi!"),
        ("📋 Clear Cooking Orders & Special Notes", "Chef ko screen par exact quantity, dish name, aur customer ka cooking note (e.g. 'Bina pyaaz', 'Extra spicy') saaf dikhta hai. KOT gum hone ka jhanjhat khatam."),
        ("🔄 1-Click Order Lifecycle Workflow", "Waiter ek click me status change karta hai: 'Start Cooking' ➔ 'Mark Food Served' ➔ 'Bill Paid & Complete'."),
        ("🗑️ Permanent Delete For Cancelled Orders", "Jo orders cancel ya reject ho gaye hain, unhe 1-click me permanently delete karne ka option taaki counter screen hamesha saaf aur fresh rahe.")
    ]

    for i, (head, desc) in enumerate(kds_cards):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + (col * 5.9))
        y = Inches(1.9 + (row * 2.5))

        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = GOLD
        card.line.width = Pt(1.5)

        tb = s6.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.1), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = head
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = GOLD

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(12)
        pd.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 7: DAILY SALES & COST HISAAB-KITAAB (OWNER ANALYTICS)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Owner Ke Liye Daily Sales, Cost & Hisaab-Kitaab Dashboard")

    features = [
        ("📅 Date Filter (Aaj, Kal, Pichla Mahina)", "Today, Yesterday, Last 7 Days, Last 30 Days ya Calendar se koi bhi puraani tareekh chun kar us din ka pura hisaab dekhein."),
        ("💰 Total Sales & Average Bill (AOV)", "Kul kitni kamai hui, kitne orders serve hue, aur har table ne lagbhag kitna spend kiya - sab real-time calculation me."),
        ("🥘 Top Selling Dishes Report", "Aaj kaun si dish sabse zyada biki? (Jaise Shahi Paneer 12 plate, Dal Makhni 8 plate). Isse grocery aur raw material khareedna aasan hota hai."),
        ("📍 Table-Wise Business Report", "Kaunsi table se kitni sale hui (Rooftop vs Family Dining Hall), taaki aapko pata chale kaun sa seating area zyada kamai de raha hai."),
        ("🖨️ 1-Click Print Daily Closing Summary", "Raat ko dukan band karte waqt 1-click me poore din ka closing summary print karein ya PDF save karein. Kacchi parchiyon ka jhanjhat khatam!")
    ]

    for i, (title, desc) in enumerate(features):
        y = Inches(1.8 + (i * 1.0))
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.7), Inches(0.85))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = GOLD
        card.line.width = Pt(1)

        tb = s7.shapes.add_textbox(Inches(1.0), y + Inches(0.1), Inches(11.3), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title + " — "
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = GOLD

        # Add description inline
        run = pt.add_run()
        run.text = desc
        run.font.size = Pt(11)
        run.font.bold = False
        run.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 8: FINANCIAL IMPACT & ROI (NUMBERS TO IMPRESS)
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Garam Masala Restaurant Ka Monthly Munafa & ROI Projection")

    stats = [
        ("₹45,000+", "Zomato/Swiggy Commission Bachat", "Dine-in orders par 25-30% commission zero"),
        ("15% - 20%", "Average Bill Growth", "Photos & category slider se extra add-ons"),
        ("₹15,000+", "Staff Efficiency Savings", "Kam waiter me zyada tables smooth management"),
        ("₹12,000", "Yearly Menu Printing Bachat", "Digital menu updates with zero paper cost")
    ]

    for i, (metric, label, sub) in enumerate(stats):
        x = Inches(0.8 + (i * 2.98))
        card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(2.8), Inches(2.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = EMERALD
        card.line.width = Pt(1.5)

        tb = s8.shapes.add_textbox(x + Inches(0.1), Inches(2.0), Inches(2.6), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        pm = tf.paragraphs[0]
        pm.alignment = PP_ALIGN.CENTER
        pm.text = metric
        pm.font.size = Pt(28)
        pm.font.bold = True
        pm.font.color.rgb = EMERALD

        pl = tf.add_paragraph()
        pl.alignment = PP_ALIGN.CENTER
        pl.text = label
        pl.font.size = Pt(13)
        pl.font.bold = True
        pl.font.color.rgb = GOLD

        ps = tf.add_paragraph()
        ps.alignment = PP_ALIGN.CENTER
        ps.text = sub
        ps.font.size = Pt(10)
        ps.font.color.rgb = GRAY

    # Big Summary Takeaway Box
    summary_box = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.5), Inches(11.7), Inches(2.3))
    summary_box.fill.solid()
    summary_box.fill.fore_color.rgb = RGBColor(18, 32, 25)
    summary_box.line.color.rgb = EMERALD
    summary_box.line.width = Pt(2)

    tb_s = s8.shapes.add_textbox(Inches(1.1), Inches(4.7), Inches(11.1), Inches(1.9))
    tf_s = tb_s.text_frame
    tf_s.word_wrap = True
    pts = tf_s.paragraphs[0]
    pts.text = "🎯 Bottom Line: Yeh System Restaurant Ke Liye Kharcha Nahi, Munafa Machine Hai!"
    pts.font.size = Pt(18)
    pts.font.bold = True
    pts.font.color.rgb = EMERALD

    pts2 = tf_s.add_paragraph()
    pts2.text = "Agar aapka restaurant daily 30-40 tables serve karta hai, to fast table turnover, extra item add-on, aur zero commission ki wajah se har mahine ₹50,000 se ₹75,000 tak ka seedha extra fayda hoga!"
    pts2.font.size = Pt(13)
    pts2.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 9: QUICK 3-STEP IMPLEMENTATION PLAN
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Restaurant Me Ise Chalu Kaise Karein? (3 Simple Steps)")

    setup_steps = [
        ("Step 1: Branded Table QR Standees", "Admin panel me jakar 'Print All QR Cards' dabayein. Har table ka unique acrylic standee print hokar table par lag jayega.", "1 Din Me Ready"),
        ("Step 2: Staff & Kitchen 10-Min Demo", "Staff ko 1-Click Captain Confirmation aur Kitchen order board dikhana. Use karna WhatsApp chalane se bhi aasan hai!", "Sirf 15 Minute"),
        ("Step 3: Go Live & Enjoy Profit", "Customer aayenge, QR scan karke order karenge. Aapke mobile par daily sales ki live report aayegi!", "Day 1 Se Results")
    ]

    for i, (st, desc, time_tag) in enumerate(setup_steps):
        x = Inches(0.8 + (i * 3.98))
        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(3.7), Inches(5.1))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = GOLD
        card.line.width = Pt(1.5)

        tb = s9.shapes.add_textbox(x + Inches(0.2), Inches(2.1), Inches(3.3), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True

        tag = tf.paragraphs[0]
        tag.text = f"⏱️ {time_tag}"
        tag.font.size = Pt(11)
        tag.font.bold = True
        tag.font.color.rgb = EMERALD

        pt = tf.add_paragraph()
        pt.text = st
        pt.font.size = Pt(18)
        pt.font.bold = True
        pt.font.color.rgb = GOLD

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(13)
        pd.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 10: CLOSING & Q&A
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)

    close_frame = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    close_frame.fill.solid()
    close_frame.fill.fore_color.rgb = CARD_BG
    close_frame.line.color.rgb = CARD_BORDER
    close_frame.line.width = Pt(2)

    tb_c = s10.shapes.add_textbox(Inches(1.5), Inches(1.5), Inches(10.33), Inches(4.5))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True

    pc1 = tf_c.paragraphs[0]
    pc1.alignment = PP_ALIGN.CENTER
    pc1.text = "Garam Masala Family Restaurant Ko Banayein Smart & Digital!"
    pc1.font.size = Pt(32)
    pc1.font.bold = True
    pc1.font.color.rgb = GOLD

    pc2 = tf_c.add_paragraph()
    pc2.alignment = PP_ALIGN.CENTER
    pc2.text = "Aaj Hi Live Demo Dekhein Aur Apne Restaurant Ki Kamai Ko Naye Level Par Le Jayein."
    pc2.font.size = Pt(18)
    pc2.font.color.rgb = WHITE

    pc3 = tf_c.add_paragraph()
    pc3.alignment = PP_ALIGN.CENTER
    pc3.text = "\n✦ Modern QR Dining • Captain Verification • Kitchen Display • Daily Sales Analytics ✦"
    pc3.font.size = Pt(14)
    pc3.font.bold = True
    pc3.font.color.rgb = LIGHT_GOLD

    pc4 = tf_c.add_paragraph()
    pc4.alignment = PP_ALIGN.CENTER
    pc4.text = "\nThank You! Let's Discuss Any Questions."
    pc4.font.size = Pt(16)
    pc4.font.bold = True
    pc4.font.color.rgb = EMERALD

    # Save presentation
    output_path = os.path.join(os.getcwd(), "Garam_Masala_Restaurant_Pitch_Deck.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")
    return output_path

if __name__ == "__main__":
    create_restaurant_pitch_deck()
