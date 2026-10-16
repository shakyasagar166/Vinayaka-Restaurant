import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_restaurant_pitch_deck():
    prs = Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette: Luxury Warm Dining Theme
    DARK_BG = RGBColor(11, 15, 25)        # #0B0F19 Deep Night
    CARD_BG = RGBColor(16, 22, 38)        # #101626 Deep Slate
    CARD_BORDER = RGBColor(217, 119, 6)   # #D97706 Warm Amber
    GOLD = RGBColor(245, 158, 11)         # #F59E0B Golden Accent
    LIGHT_GOLD = RGBColor(253, 230, 138)  # #FDE68A Soft Golden Cream
    WHITE = RGBColor(255, 255, 255)       # Pure White
    GRAY = RGBColor(156, 163, 175)        # Neutral Muted Silver
    EMERALD = RGBColor(16, 185, 129)      # Profit Green
    RED_ACCENT = RGBColor(239, 68, 68)    # Alert / Problem Red

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = DARK_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="GARAM MASALA FAMILY RESTAURANT • DINE-IN AUTOMATION PLATFORM"):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = GOLD

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(25)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    frame = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.7), Inches(11.733), Inches(6.1))
    frame.fill.solid()
    frame.fill.fore_color.rgb = CARD_BG
    frame.line.color.rgb = CARD_BORDER
    frame.line.width = Pt(2)

    tag_box = s1.shapes.add_textbox(Inches(1.5), Inches(1.1), Inches(10.33), Inches(0.5))
    tf_tag = tag_box.text_frame
    p_tag = tf_tag.paragraphs[0]
    p_tag.alignment = PP_ALIGN.CENTER
    p_tag.text = "✦ SMART RESTAURANT AUTOMATION & PROFIT BOOSTER ✦"
    p_tag.font.size = Pt(12)
    p_tag.font.bold = True
    p_tag.font.color.rgb = GOLD

    h1_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.9), Inches(1.8))
    tf_h1 = h1_box.text_frame
    tf_h1.word_wrap = True
    p_h1 = tf_h1.paragraphs[0]
    p_h1.alignment = PP_ALIGN.CENTER
    p_h1.text = "Garam Masala Family Restaurant"
    p_h1.font.size = Pt(36)
    p_h1.font.bold = True
    p_h1.font.color.rgb = WHITE

    p_sub = tf_h1.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.text = "Smart QR Dine-In Ordering • Waiter Salary Savings • Kitchen Bell Chime • Daily Hisaab"
    p_sub.font.size = Pt(18)
    p_sub.font.bold = True
    p_sub.font.color.rgb = LIGHT_GOLD

    pills = [
        ("💰 Waiter Salary Bachat", "1 Waiter ka kharcha kam (Har mahine ₹12,000+ bachat)"),
        ("🛡️ Captain 1-Click Verify", "Fake/Ghar baithe order se 100% bachat, zero khana barbad"),
        ("⚡ 20 Min Fast Table Turnover", "Rush hour me table jaldi khali, zyada grahak, zyada kamai")
    ]
    pill_w = Inches(3.5)
    start_x = Inches(1.3)
    y_pos = Inches(3.9)

    for i, (p_title, p_desc) in enumerate(pills):
        px = start_x + (i * Inches(3.7))
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, y_pos, pill_w, Inches(1.4))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(12, 16, 28)
        card.line.color.rgb = GOLD
        card.line.width = Pt(1.5)

        tb = s1.shapes.add_textbox(px, y_pos + Inches(0.12), pill_w, Inches(1.15))
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

    ft = s1.shapes.add_textbox(Inches(1.5), Inches(5.7), Inches(10.33), Inches(0.6))
    p_ft = ft.text_frame.paragraphs[0]
    p_ft.alignment = PP_ALIGN.CENTER
    p_ft.text = "Specially Prepared for Restaurant Owner • Sagar Shakya & Management Team"
    p_ft.font.size = Pt(12)
    p_ft.font.color.rgb = GRAY

    # ==========================================
    # SLIDE 2: DINE-IN PROBLEMS VS SMART SOLUTION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Traditional Paper Menu Ki Musibatein vs Smart QR System")

    # Left: Problems
    c_old = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1))
    c_old.fill.solid()
    c_old.fill.fore_color.rgb = RGBColor(26, 15, 18)
    c_old.line.color.rgb = RED_ACCENT
    c_old.line.width = Pt(1.5)

    tb_old = s2.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.7))
    tf_old = tb_old.text_frame
    tf_old.word_wrap = True
    p1 = tf_old.paragraphs[0]
    p1.text = "❌ Offline Restaurant Ki 5 Badi Dikkatain"
    p1.font.size = Pt(17)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(248, 113, 113)

    old_points = [
        ("Extra Waiter Ka Bada Kharcha:", "Rush hour sambhalne ke liye 2-3 extra waiter rakhne padte hain (₹12,000/waiter salary)."),
        ("Menu Gande & Reprint Ka Kharcha:", "Gravy/tel se menu kharab hota hai. Rate badle to ₹3,000-₹5,000 printing lagti hai."),
        ("Order Likhne Me Waiter Ki Galti:", "Half ki jagah Full likh diya ya mirch ka dhyan nahi diya - khana barbad!"),
        ("Rush Me Table Ghanton Block Rehna:", "Menu lane, sochne aur order lene me 20 minute waste hote hain."),
        ("Grahakon Ka Koi Data Nahi:", "Jo family khakar gayi, unka koi phone number nahi rehta (repeat marketing impossible).")
    ]
    for title, desc in old_points:
        pt = tf_old.add_paragraph()
        pt.text = f"• {title} {desc}"
        pt.font.size = Pt(11)
        pt.font.color.rgb = RGBColor(229, 231, 235)

    # Right: Solutions
    c_new = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.1))
    c_new.fill.solid()
    c_new.fill.fore_color.rgb = RGBColor(13, 30, 24)
    c_new.line.color.rgb = EMERALD
    c_new.line.width = Pt(1.5)

    tb_new = s2.shapes.add_textbox(Inches(7.2), Inches(2.0), Inches(5.0), Inches(4.7))
    tf_new = tb_new.text_frame
    tf_new.word_wrap = True
    p2 = tf_new.paragraphs[0]
    p2.text = "✅ Garam Masala Smart QR Ke Fayde"
    p2.font.size = Pt(17)
    p2.font.bold = True
    p2.font.color.rgb = EMERALD

    new_points = [
        ("1 Waiter Handles 10 Tables:", "Customer khud mobile se photos dekhkar order karta hai. Extra waiter hire nahi karna padega!"),
        ("₹0 Zero Menu Reprint Kharcha:", "Sabzi ya paneer ka rate badha, mobile se 5 second me update karo. Sabhi QR par live!"),
        ("100% Exact Order Kitchen Me:", "Customer ka portion aur chef instruction seedha kitchen display par jata hai."),
        ("20 Minute Fast Table Turnover:", "Customer baithte hi 3 minute me order karta hai. Table jaldi khali hogi, zyada customer baithenge!"),
        ("Customer Mobile Directory:", "Har customer ka phone number auto-save hota hai. Holi, Diwali par WhatsApp offer bhejo!")
    ]
    for title, desc in new_points:
        pt = tf_new.add_paragraph()
        pt.text = f"• {title} {desc}"
        pt.font.size = Pt(11)
        pt.font.color.rgb = RGBColor(209, 250, 229)

    # ==========================================
    # SLIDE 3: DIRECT FINANCIAL SAVINGS & ROI
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Owner Ka Asli Hisaab: Har Mahine ₹45,000+ Ki Seedhi Bachat!")

    cards_roi = [
        ("🧑‍🍳 Waiter Salary Bachat", "₹12,000 / Mahina", "1 extra waiter/helper ki salary aur khana-peena bachega kyunki customer khud scan karke order karega."),
        ("📜 Menu Reprinting Bachat", "₹3,000 / Mahina", "Gande menu badalna ya rate change par nayi printing ka kharcha permanently ₹0 ho jayega."),
        ("⚡ Fast Table Turnover Kamai", "₹30,000 / Mahina", "Rush hour me har table 20 minute jaldi khali hogi. Roz 2-3 extra families baithne se daily ₹1,000-₹1,500 extra bachega."),
        ("🛡️ Order Mistake Wastage Bachat", "₹4,000 / Mahina", "Waiter ki likhne ki galti khatam. Customer wahi payega jo usne khud select kiya hai.")
    ]

    card_w = Inches(5.6)
    card_h = Inches(2.3)
    positions = [
        (Inches(0.8), Inches(1.8)),
        (Inches(6.9), Inches(1.8)),
        (Inches(0.8), Inches(4.5)),
        (Inches(6.9), Inches(4.5))
    ]

    for (title, value, detail), (cx, cy) in zip(cards_roi, positions):
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, card_w, card_h)
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER
        c.line.width = Pt(1.5)

        tb = s3.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.15), card_w - Inches(0.5), card_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = GOLD

        pv = tf.add_paragraph()
        pv.text = f"Bachat: {value}"
        pv.font.size = Pt(18)
        pv.font.bold = True
        pv.font.color.rgb = EMERALD

        pd = tf.add_paragraph()
        pd.text = detail
        pd.font.size = Pt(11)
        pd.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 4: CAPTAIN 1-CLICK CONFIRMATION (FAKE ORDER SOLUTION)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Owner Ka Sabse Bada Darr Solve: 'Ghar Baithe Fake Order Ka Ilaaj'")

    # Big Banner Explanation
    top_c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(2.2))
    top_c.fill.solid()
    top_c.fill.fore_color.rgb = RGBColor(18, 25, 42)
    top_c.line.color.rgb = GOLD
    top_c.line.width = Pt(1.5)

    tb_top = s4.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(1.8))
    tf_top = tb_top.text_frame
    tf_top.word_wrap = True
    ptop_title = tf_top.paragraphs[0]
    ptop_title.text = "🛡️ Captain / Waiter 1-Click Verification System"
    ptop_title.font.size = Pt(18)
    ptop_title.font.bold = True
    ptop_title.font.color.rgb = GOLD

    ptop_desc = tf_top.add_paragraph()
    ptop_desc.text = "Agar koi shaitani customer QR code ki photo khinch kar ghar chala jaye aur wahan se prank order kare, to restaurant ko 1 rupaye ka bhi nuksan nahi hoga! Jab tak restaurant ka captain table par customer ko dekhkar 1-Click 'Accept' nahi karega, tab tak kitchen me khana banna shuru hi nahi hoga!"
    ptop_desc.font.size = Pt(12)
    ptop_desc.font.color.rgb = WHITE

    # 3-step action boxes
    steps = [
        ("Step 1: Order Alert Aaya", "Mobile par ghanti baji: 'Table 4 par Shahi Paneer order hua'. Admin screen par golden alert aaya."),
        ("Step 2: Table Check Kiya", "Captain/Waiter ne Table 4 par dekha ki family baithi hai ya nahi."),
        ("Step 3: 1-Click Action", "Family baithi hai to 'Accept & Send to Kitchen' dabao. Agar table khali hai to 'Reject (Fake Order)' dabao!")
    ]
    sw = Inches(3.6)
    for i, (st, sd) in enumerate(steps):
        sx = Inches(0.8) + (i * Inches(4.0))
        sc = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, Inches(4.3), sw, Inches(2.4))
        sc.fill.solid()
        sc.fill.fore_color.rgb = RGBColor(12, 16, 28)
        sc.line.color.rgb = EMERALD if i == 2 else GOLD
        sc.line.width = Pt(1.5)

        stb = s4.shapes.add_textbox(sx + Inches(0.2), Inches(4.5), sw - Inches(0.4), Inches(2.0))
        stf = stb.text_frame
        stf.word_wrap = True
        spt = stf.paragraphs[0]
        spt.text = st
        spt.font.size = Pt(14)
        spt.font.bold = True
        spt.font.color.rgb = GOLD

        spd = stf.add_paragraph()
        spd.text = sd
        spd.font.size = Pt(11)
        spd.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 5: KITCHEN DING-DONG BELL SYSTEM
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Kitchen Dining Bell: 'Ding-Dong ... Ding-Dong' Live Chime System")

    col_w = Inches(5.6)
    
    # Left: How sound works
    c_snd = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), col_w, Inches(5.1))
    c_snd.fill.solid()
    c_snd.fill.fore_color.rgb = CARD_BG
    c_snd.line.color.rgb = GOLD
    c_snd.line.width = Pt(1.5)

    tb_snd = s5.shapes.add_textbox(Inches(1.1), Inches(2.0), col_w - Inches(0.6), Inches(4.7))
    tf_snd = tb_snd.text_frame
    tf_snd.word_wrap = True
    psnd_t = tf_snd.paragraphs[0]
    psnd_t.text = "🔔 Noisy Kitchen Me Bhi Awaaz Saaf Aayegi"
    psnd_t.font.size = Pt(17)
    psnd_t.font.bold = True
    psnd_t.font.color.rgb = GOLD

    snd_points = [
        ("Authentic Brass Desk Bell:", "Luxury hotel counter jaisi 2-cycle 'Ding-Dong ... Ding-Dong' chime bajti hai."),
        ("Multi-Device Polling Engine:", "Customer apne kisi bhi mobile se order kare, counter ke laptop/phone par turant ghanti bajegi."),
        ("Mobile Vibration Alert:", "Kitchen chef ya captain ke pocket me phone vibrate bhi hota hai taaki koi order miss na ho."),
        ("One-Click Test Bell Button:", "Admin screen par 'Test Bell 🛎️' button diya hai, kabhi bhi sound test kar sakte hain.")
    ]
    for st, sd in snd_points:
        p = tf_snd.add_paragraph()
        p.text = f"• {st} {sd}"
        p.font.size = Pt(12)
        p.font.color.rgb = WHITE

    # Right: Order Tracking in IST
    c_trk = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), col_w, Inches(5.1))
    c_trk.fill.solid()
    c_trk.fill.fore_color.rgb = CARD_BG
    c_trk.line.color.rgb = EMERALD
    c_trk.line.width = Pt(1.5)

    tb_trk = s5.shapes.add_textbox(Inches(7.2), Inches(2.0), col_w - Inches(0.6), Inches(4.7))
    tf_trk = tb_trk.text_frame
    tf_trk.word_wrap = True
    ptrk_t = tf_trk.paragraphs[0]
    ptrk_t.text = "⏰ Accurate Indian Time (IST) & Instant Delete"
    ptrk_t.font.size = Pt(17)
    ptrk_t.font.bold = True
    ptrk_t.font.color.rgb = EMERALD

    trk_points = [
        ("Exact Indian Local Time (12-Hr):", "Order par 'Time: 08:35 PM' exact dikhega, koi UTC/foreign timezone lag nahi."),
        ("Live Elapsed Timer:", "Har card par dikhta hai: '2 min pehle', '5 min pehle' - waiter ko pata rehta hai kis table ko pehle khana dena hai."),
        ("Permanent Delete Option (🗑️):", "Koi cancelled ya test order ho, card ke upar 1 click me permanently delete ho jata hai bina kisi delay ke."),
        ("Live Status Tracking For Customer:", "Customer ke phone par bhi live dikhta hai: 'Verification Pending -> Cooking -> Served'.")
    ]
    for st, sd in trk_points:
        p = tf_trk.add_paragraph()
        p.text = f"• {st} {sd}"
        p.font.size = Pt(12)
        p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 6: 1-CLICK MENU & STOCK CONTROL
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Stock & Price Control: 5 Second Me Rate Badlo Ya Sold Out Karo")

    c_menu = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.1))
    c_menu.fill.solid()
    c_menu.fill.fore_color.rgb = CARD_BG
    c_menu.line.color.rgb = CARD_BORDER
    c_menu.line.width = Pt(1.5)

    tb_menu = s6.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.9), Inches(4.5))
    tf_menu = tb_menu.text_frame
    tf_menu.word_wrap = True

    p_mt = tf_menu.paragraphs[0]
    p_mt.text = "🍲 Restaurant Owner Ko Kisi Ke Aage Haath Nahi Phailana Padega!"
    p_mt.font.size = Pt(18)
    p_mt.font.bold = True
    p_mt.font.color.rgb = GOLD

    features_menu = [
        ("1-Click 'In Stock' / 'Sold Out' Toggle:", "Shaam ko Dal Makhani ya Paneer Tikka khatam ho gaya? 1 click me 'Sold Out' mark karo. Customer mang hi nahi payega, naraz hone ka sawal hi nahi!"),
        ("Instant Rate Edit (No Printing Cost):", "Sabzi, tel ya butter mehenga hua? Admin portal kholo, 5 second me ₹250 ka ₹280 karo. Sabhi table ke QR me turant naya rate chalega."),
        ("Garam Masala Ka Pura 101 Items Menu Pre-Loaded:", "Starters, Tandoor, Main Course, Chinese, Thali, Breads, Desserts - saari dishes pre-seeded hain HD photos ke sath."),
        ("Chef's Special & Veg/Non-Veg Badges:", "Aapki special dishes par 'Chef Special ⭐' badge dikhta hai jisse grahak zyada mehengi aur profitable dishes order karte hain.")
    ]
    for ft_t, ft_d in features_menu:
        p = tf_menu.add_paragraph()
        p.text = f"✦ {ft_t} {ft_d}"
        p.font.size = Pt(13)
        p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 7: DAILY SALES & COST REPORT
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Daily Sales & Cost Hisaab: Raat Ko Kacchi Parchi Jodne Ki Chhutti!")

    # 4 KPI Highlights
    kpis = [
        ("📊 Total Daily Sale", "Aaj kitne rupaye ka dhandha hua, 1 click me cash/UPI total dekhein."),
        ("🔢 Completed vs Cancelled", "Kitne order complete hue aur kitne reject hue, pura record safe."),
        ("🏆 Best-Selling Dishes", "Kaunsi sabzi ya starter sabse zyada bika, taaki agle din wahi taaza mangwaya jaye."),
        ("🖨️ 1-Click Print & PDF", "Raat ko 1-click me poore din ka hisaab receipt printer ya PDF me download karein.")
    ]
    for i, (kt, kd) in enumerate(kpis):
        kx = Inches(0.8) + (i * Inches(2.95))
        kc = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, kx, Inches(1.8), Inches(2.8), Inches(2.0))
        kc.fill.solid()
        kc.fill.fore_color.rgb = RGBColor(14, 20, 34)
        kc.line.color.rgb = GOLD
        kc.line.width = Pt(1.5)

        ktb = s7.shapes.add_textbox(kx + Inches(0.15), Inches(1.95), Inches(2.5), Inches(1.7))
        ktf = ktb.text_frame
        ktf.word_wrap = True
        kp1 = ktf.paragraphs[0]
        kp1.text = kt
        kp1.font.size = Pt(13)
        kp1.font.bold = True
        kp1.font.color.rgb = GOLD

        kp2 = ktf.add_paragraph()
        kp2.text = kd
        kp2.font.size = Pt(10)
        kp2.font.color.rgb = WHITE

    # Bottom summary box
    bot_c = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.2), Inches(11.7), Inches(2.7))
    bot_c.fill.solid()
    bot_c.fill.fore_color.rgb = CARD_BG
    bot_c.line.color.rgb = EMERALD
    bot_c.line.width = Pt(1.5)

    bot_tb = s7.shapes.add_textbox(Inches(1.1), Inches(4.4), Inches(11.1), Inches(2.3))
    bot_tf = bot_tb.text_frame
    bot_tf.word_wrap = True
    bp_t = bot_tf.paragraphs[0]
    bp_t.text = "📈 Chori aur Gaban Par 100% Rok (Complete Transparency)"
    bp_t.font.size = Pt(17)
    bp_t.font.bold = True
    bp_t.font.color.rgb = EMERALD

    b_points = [
        ("Har Order Ka Digital Number:", "Har order ka VR-Number hota hai. Waiter bina bill dikhaye jeb me paisa nahi rakh sakta."),
        ("Owner Chahe Restaurant Me Na Ho:", "Owner apne ghar ya gaadi me baithkar bhi apne mobile par live dekh sakta hai ki restaurant me abhi kitni sale chal rahi hai!"),
        ("Tariq-Wise (Calendar) History:", "1 mahina ya 6 mahine purana kisi bhi din ka hisaab 1 click me nikal sakte hain.")
    ]
    for bt, bd in b_points:
        p = bot_tf.add_paragraph()
        p.text = f"• {bt} {bd}"
        p.font.size = Pt(12)
        p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 8: CUSTOMER DATA & WHATSAPP MARKETING
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Grahakon Ka Mobile Database: Holi, Diwali & Sunday Offers Bhejo!")

    c_crm = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.1))
    c_crm.fill.solid()
    c_crm.fill.fore_color.rgb = CARD_BG
    c_crm.line.color.rgb = CARD_BORDER
    c_crm.line.width = Pt(1.5)

    tb_crm = s8.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.9), Inches(4.5))
    tf_crm = tb_crm.text_frame
    tf_crm.word_wrap = True

    p_crm_t = tf_crm.paragraphs[0]
    p_crm_t.text = "📱 Offline Restaurant Ka Sabse Bada Khazana: Grahak Ka Phone Number!"
    p_crm_t.font.size = Pt(18)
    p_crm_t.font.bold = True
    p_crm_t.font.color.rgb = GOLD

    crm_points = [
        ("Auto-Save Customer Database:", "Har bar jab family order karti hai, unka Naam aur Mobile Number database me jud jata hai. 2 mahine me aapke paas 500-1,000 local parivaron ka data hoga."),
        ("Diwali / New Year Festive Campaigns:", "Tyohar par sabhi grahakon ko 1 click me WhatsApp message bhejo: 'Garam Masala me Diwali Special Handi Paneer par 10% discount'."),
        ("Repeat Footfall (Wapas Bulao):", "Jo grahak 1 mahine se nahi aaya, use automatically 'We Miss You' message bhejkar wapas attract karo."),
        ("Zero Marketing Cost:", "Paper pamhplet chhapwana aur batwana band. Sidha grahak ke WhatsApp par direct promotion!")
    ]
    for c_t, c_d in crm_points:
        p = tf_crm.add_paragraph()
        p.text = f"✦ {c_t} {c_d}"
        p.font.size = Pt(13)
        p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 9: COMMERCIAL PRICING PLANS
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Owner Ke Liye 2 Aasan Aur Kifayati Pricing Plans")

    # Plan A: One Time
    c_p1 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1))
    c_p1.fill.solid()
    c_p1.fill.fore_color.rgb = RGBColor(14, 22, 38)
    c_p1.line.color.rgb = GOLD
    c_p1.line.width = Pt(2)

    tb_p1 = s9.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.7))
    tf_p1 = tb_p1.text_frame
    tf_p1.word_wrap = True

    pp1 = tf_p1.paragraphs[0]
    pp1.text = "⭐ PLAN 1: One-Time Full Setup (Best)"
    pp1.font.size = Pt(17)
    pp1.font.bold = True
    pp1.font.color.rgb = GOLD

    pp1_price = tf_p1.add_paragraph()
    pp1_price.text = "₹12,000 - ₹15,000 (Ek Baar Me Pura Deal)"
    pp1_price.font.size = Pt(18)
    pp1_price.font.bold = True
    pp1_price.font.color.rgb = EMERALD

    p1_items = [
        "Pura System Setup & 101 Dishes Live",
        "Sabhi Tables Ke QR Standee Printable PDF Files",
        "1 Pura Saal Cloud Server & Hosting FREE",
        "Waiter & Captain Ki Complete Training",
        "24/7 Peak Hours Emergency Support",
        "Next Year Se: Sirf ₹2,500/Saal Server Renewal"
    ]
    for item in p1_items:
        p = tf_p1.add_paragraph()
        p.text = f"✓ {item}"
        p.font.size = Pt(11)
        p.font.color.rgb = WHITE

    # Plan B: Monthly
    c_p2 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.1))
    c_p2.fill.solid()
    c_p2.fill.fore_color.rgb = RGBColor(14, 22, 38)
    c_p2.line.color.rgb = CARD_BORDER
    c_p2.line.width = Pt(2)

    tb_p2 = s9.shapes.add_textbox(Inches(7.2), Inches(2.0), Inches(5.0), Inches(4.7))
    tf_p2 = tb_p2.text_frame
    tf_p2.word_wrap = True

    pp2 = tf_p2.paragraphs[0]
    pp2.text = "💡 PLAN 2: Low-Budget Monthly AMC"
    pp2.font.size = Pt(17)
    pp2.font.bold = True
    pp2.font.color.rgb = LIGHT_GOLD

    pp2_price = tf_p2.add_paragraph()
    pp2_price.text = "₹999 / Mahina (Sirf ₹33/Din - Ek Chai Barabar!)"
    pp2_price.font.size = Pt(18)
    pp2_price.font.bold = True
    pp2_price.font.color.rgb = EMERALD

    p2_items = [
        "Chhota One-time Setup: Sirf ₹4,999",
        "Monthly ₹999 Me Cloud Server & Uptime",
        "Database Cloud Backup 24/7 Surakshit",
        "Emergency Bug Fix & Support Included",
        "Jab Chahe Band Ya Renew Kar Sakte Hain",
        "Owner Ki Jeb Par Shuru Me Koi Bojh Nahi"
    ]
    for item in p2_items:
        p = tf_p2.add_paragraph()
        p.text = f"✓ {item}"
        p.font.size = Pt(11)
        p.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 10: NEXT STEPS & IMMEDIATE LAUNCH
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Aage Ka Kadam: Sirf 24 Ghante Me Restaurant Live Karein!")

    c_steps = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.1))
    c_steps.fill.solid()
    c_steps.fill.fore_color.rgb = CARD_BG
    c_steps.line.color.rgb = CARD_BORDER
    c_steps.line.width = Pt(1.5)

    tb_s10 = s10.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.9), Inches(4.5))
    tf_s10 = tb_s10.text_frame
    tf_s10.word_wrap = True

    p_s10_t = tf_s10.paragraphs[0]
    p_s10_t.text = "🚀 Implementation Plan (Bina Kisi Rukawat Ke Shuru Karein)"
    p_s10_t.font.size = Pt(18)
    p_s10_t.font.bold = True
    p_s10_t.font.color.rgb = GOLD

    launch_steps = [
        ("Day 1 - Table Standees Printing:", "Garam Masala ke premium acrylic table QR standees taiyar karke tables par lagana."),
        ("Day 1 - 15 Minute Staff Training:", "Waiter aur counter staff ko 15 minute me samjhana (system itna aasan hai ki koi bhi 5 minute me seekh jata hai)."),
        ("Day 1 - Live Launch & Trial:", "Same day dinner rush me system chalu karna aur pehle din se hi table turnover aur bachat ka asar dekhna."),
        ("Ongoing Tech Support:", "Hum back-end par 24/7 active rahenge taaki restaurant ka kaam bilkul makhhan ki tarah chalta rahe.")
    ]
    for ls_t, ls_d in launch_steps:
        p = tf_s10.add_paragraph()
        p.text = f"✦ {ls_t} {ls_d}"
        p.font.size = Pt(13)
        p.font.color.rgb = WHITE

    # Save to disk
    out_path = os.path.abspath("Garam_Masala_Family_Restaurant_Pitch_Deck.pptx")
    prs.save(out_path)
    print("SUCCESS: PPT Saved successfully at:", out_path)

    # Also try saving to original name if not locked by PowerPoint
    try:
        orig = os.path.abspath("Garam_Masala_Restaurant_Pitch_Deck.pptx")
        prs.save(orig)
        print("Also updated:", orig)
    except Exception as e:
        print("Note: Original file is currently open in PowerPoint, saved to new file.")

    return out_path

if __name__ == "__main__":
    create_restaurant_pitch_deck()
