import React, { useState, useEffect } from 'react';
import { Store, User, Phone, MapPin, Clock, Sparkles, Check, Save, Image, HeartHandshake, Eye } from 'lucide-react';
import { api } from '../api/api';

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    restaurantName: 'Garam Masala Family Restaurant',
    tagline: 'असली स्वाद, शुद्ध मसाले और पारिवारिक माहौल',
    ownerName: 'Sagar Shakya',
    ownerTitle: 'Owner & Host',
    aboutStory: 'गरम मसाला फैमिली रेस्टोरेंट में आपका हार्दिक स्वागत है! हम अपने ग्राहकों को शुद्ध, ताज़ा और लाजवाब स्वाद परोसने के लिए प्रतिबद्ध हैं। हमारे यहाँ विशेष तंदूरी रोटियाँ, स्वादिष्ट पनीर व दाल हांडी, क्रिस्पी चिली पोटैटो, और देसी चाउमीन खास अंदाज़ में तैयार की जाती हैं।',
    contactPhone: '+91 98765 43210',
    address: 'Garam Masala Restaurant, Near Main Market',
    openingHours: '11:00 AM - 11:30 PM (Daily)',
    bannerImage: '/images/restaurant-interior.webp'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getRestaurantProfile();
        if (data) setProfile(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.warn("Could not fetch remote profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await api.updateRestaurantProfile(profile);
      if (updated) setProfile(prev => ({ ...prev, ...updated }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert("Profile save karne me samasya aayi: " + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const storePhotoPresets = [
    { label: "Restaurant Dining Ambiance", url: "/images/restaurant-interior.webp" },
    { label: "Tandoori Roti & Handi Gravy", url: "/images/tandoori-roti-gravy.webp" },
    { label: "Crispy Chilli Potato", url: "/images/crispy-chilli-potato.jpg" },
    { label: "Desi Spicy Chowmein", url: "/images/desi-chowmein.jpg" },
    { label: "Tandoori Spread Feast", url: "/images/tandoori-spread.jpg" }
  ];

  if (loading) {
    return (
      <div className="py-12 text-center text-amber-300">
        <Store className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
        <p className="text-sm">रेस्टोरेंट प्रोफ़ाइल लोड हो रही है...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#101626] border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-300">
                Restaurant &amp; Owner Profile Settings
              </h3>
              <p className="text-xs text-gray-400">
                यहाँ से रेस्टोरेंट का नाम, ओनर (मालिक) की जानकारी और स्टोरी सेट करें — यह कस्टमर मेनू पर तुरंत दिखेगा।
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-lg animate-bounce">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>जानकारी सफलता पूर्वक सुरक्षित हो गई! (Saved &amp; Synced)</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Edit Form */}
        <div className="lg:col-span-2 bg-[#0c111e] border border-gray-800 rounded-3xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Restaurant Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restaurant Name (रेस्टोरेंट का नाम)</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.restaurantName}
                  onChange={(e) => setProfile({ ...profile, restaurantName: e.target.value })}
                  placeholder="Garam Masala Family Restaurant"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tagline / Slogan (स्लोगन)</span>
                </label>
                <input
                  type="text"
                  value={profile.tagline || ''}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  placeholder="असली स्वाद, शुद्ध मसाले और पारिवारिक माहौल"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Owner Details */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <User className="w-4 h-4 text-amber-400" />
                <span>Owner &amp; Management Information (ओनर / संचालक)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Owner Name (ओनर का नाम)
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.ownerName || ''}
                    onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                    placeholder="Sagar Shakya"
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Owner Role / Title (पद)
                  </label>
                  <input
                    type="text"
                    value={profile.ownerTitle || ''}
                    onChange={(e) => setProfile({ ...profile, ownerTitle: e.target.value })}
                    placeholder="Owner &amp; Host"
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* About Story */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                <span>About Restaurant &amp; Our Story (रेस्टोरेंट और भोजन की विशेषता)</span>
              </label>
              <textarea
                rows={4}
                value={profile.aboutStory || ''}
                onChange={(e) => setProfile({ ...profile, aboutStory: e.target.value })}
                placeholder="रेस्टोरेंट की खासियत, असली मसालों का स्वाद, और ग्राहकों के स्वागत के बारे में लिखें..."
                className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none leading-relaxed"
              />
            </div>

            {/* Contact, Address & Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={profile.contactPhone || ''}
                  onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Opening Timings</span>
                </label>
                <input
                  type="text"
                  value={profile.openingHours || ''}
                  onChange={(e) => setProfile({ ...profile, openingHours: e.target.value })}
                  placeholder="11:00 AM - 11:30 PM (Daily)"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Location / Address</span>
                </label>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Near Main Market"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Banner Image URL & Quick Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurant Banner / Ambiance Photo (रेस्टोरेंट की फ़ोटो)</span>
              </label>
              <input
                type="text"
                value={profile.bannerImage || ''}
                onChange={(e) => setProfile({ ...profile, bannerImage: e.target.value })}
                placeholder="/images/restaurant-interior.webp"
                className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none mb-2"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-gray-400 self-center">असली फ़ोटो चुनें:</span>
                {storePhotoPresets.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProfile({ ...profile, bannerImage: photo.url })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      profile.bannerImage === photo.url
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {photo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <span>सेव हो रहा है...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Restaurant Profile (सुरक्षित करें)</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Card */}
        <div className="bg-[#0c111e] border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Live Customer Preview</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Live
              </span>
            </div>

            {/* Banner preview */}
            <div className="h-44 rounded-2xl overflow-hidden border border-gray-800 relative bg-black/40">
              <img
                src={profile.bannerImage || '/images/restaurant-interior.webp'}
                alt={profile.restaurantName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/restaurant-interior.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-cinzel font-extrabold text-base text-amber-300">
                  {profile.restaurantName}
                </h4>
                <p className="text-[11px] text-gray-300 line-clamp-1">
                  {profile.tagline}
                </p>
              </div>
            </div>

            {/* Owner badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Restaurant Owner
              </span>
              <p className="text-sm font-extrabold text-white">
                {profile.ownerName || 'Sagar Shakya'}
              </p>
              <p className="text-xs text-gray-400">
                {profile.ownerTitle || 'Owner & Host'}
              </p>
            </div>

            {/* Story excerpt */}
            <div className="text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-gray-800/80 leading-relaxed italic">
              "{profile.aboutStory || 'Welcome to our authentic culinary home!'}"
            </div>

            {/* Contact quick preview */}
            <div className="space-y-1.5 text-xs text-gray-400 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{profile.contactPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{profile.openingHours || '11:00 AM - 11:30 PM'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{profile.address || 'Main Market'}</span>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-500 text-center">
            यह कार्ड कस्टमर के मुख्य पेज पर 'About Restaurant' में लाइव दिखेगा।
          </div>
        </div>

      </div>

    </div>
  );
}
