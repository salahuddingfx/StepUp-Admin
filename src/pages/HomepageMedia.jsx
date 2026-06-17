import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, Plus, Trash2, GripVertical, Eye, Video, Quote } from 'lucide-react';
import { getSettings, updateSettings } from '../services/admin.service';

const emptySlide = {
  badge: '',
  titleStart: '',
  titleHighlight: '',
  titleEnd: '',
  desc: '',
  ctaText: '',
  ctaLink: '',
  glowClass: 'bg-brand-red/5'
};

const glowOptions = [
  { value: 'bg-brand-red/5', label: 'Red' },
  { value: 'bg-blue-500/5', label: 'Blue' },
  { value: 'bg-emerald-500/5', label: 'Emerald' },
  { value: 'bg-purple-500/5', label: 'Purple' },
  { value: 'bg-amber-500/5', label: 'Amber' }
];

const HomepageMedia = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('slides');
  const [localSlides, setLocalSlides] = useState([]);
  const [expandedSlide, setExpandedSlide] = useState(null);

  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [founderQuote, setFounderQuote] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderRole, setFounderRole] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success && response.data) {
          setSettings(response.data);
          setLocalSlides(response.data.heroSlides || []);
          setIntroVideoUrl(response.data.introVideoUrl || '');
          setFounderQuote(response.data.founderQuote || '');
          setFounderName(response.data.founderName || '');
          setFounderRole(response.data.founderRole || '');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load settings');
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSlideChange = (index, field, value) => {
    const updated = [...localSlides];
    updated[index] = { ...updated[index], [field]: value };
    setLocalSlides(updated);
  };

  const addSlide = () => {
    setLocalSlides([...localSlides, { ...emptySlide }]);
    setExpandedSlide(localSlides.length);
  };

  const removeSlide = (index) => {
    if (localSlides.length <= 1) {
      toast.error('At least one slide is required');
      return;
    }
    const updated = localSlides.filter((_, i) => i !== index);
    setLocalSlides(updated);
    if (expandedSlide === index) setExpandedSlide(null);
  };

  const moveSlide = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= localSlides.length) return;
    const updated = [...localSlides];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setLocalSlides(updated);
    setExpandedSlide(target);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        heroSlides: localSlides,
        introVideoUrl,
        founderQuote,
        founderName,
        founderRole
      };
      const response = await updateSettings(payload);
      if (response.success) {
        toast.success('Homepage media settings saved!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
      </div>
    );
  }

  const tabs = [
    { id: 'slides', label: 'Hero Slider Manager', icon: Eye },
    { id: 'founder', label: 'Founder Intro & Video', icon: Video }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Homepage Media Settings</h2>
        <p className="text-xs text-gray-500">Manage hero slides, founder introduction video, and quotes.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white dark:bg-brand-darkGray rounded-2xl p-1.5 border border-gray-200/50 dark:border-gray-800/80 w-fit shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-red text-white shadow-md shadow-brand-red/15'
                  : 'text-gray-500 hover:text-brand-black dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Slides Tab */}
      {activeTab === 'slides' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{localSlides.length} slide(s) configured</p>
            <button
              onClick={addSlide}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add Slide</span>
            </button>
          </div>

          {localSlides.length === 0 && (
            <div className="bg-white dark:bg-brand-darkGray rounded-3xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center">
              <Eye className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-semibold">No slides yet. Add your first hero slide.</p>
            </div>
          )}

          <div className="space-y-3">
            {localSlides.map((slide, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-brand-darkGray rounded-3xl border border-gray-200/50 dark:border-gray-800/80 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSlide(expandedSlide === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-brand-black/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1); }}
                        className="text-gray-400 hover:text-brand-red disabled:opacity-20"
                        disabled={idx === 0}
                      >
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1); }}
                        className="text-gray-400 hover:text-brand-red disabled:opacity-20"
                        disabled={idx === localSlides.length - 1}
                      >
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-black dark:text-white text-left">
                        Slide {idx + 1}: {slide.badge || 'Untitled'}
                      </p>
                      <p className="text-[10px] text-gray-400 text-left truncate max-w-md">
                        {slide.titleStart}{slide.titleHighlight}{slide.titleEnd}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`h-3 w-3 rounded-full ${slide.glowClass} border border-gray-300/30`} />
                    <Trash2
                      onClick={(e) => { e.stopPropagation(); removeSlide(idx); }}
                      className="h-4 w-4 text-red-400 hover:text-red-600 transition-colors"
                    />
                  </div>
                </button>

                {expandedSlide === idx && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800/50 pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Badge Label</label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => handleSlideChange(idx, 'badge', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                          placeholder="e.g. Welcome To English StepUp"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Glow Color</label>
                        <select
                          value={slide.glowClass}
                          onChange={(e) => handleSlideChange(idx, 'glowClass', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                        >
                          {glowOptions.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Title Start</label>
                        <input
                          type="text"
                          value={slide.titleStart}
                          onChange={(e) => handleSlideChange(idx, 'titleStart', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                          placeholder="e.g. Master English With "
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Title Highlight</label>
                        <input
                          type="text"
                          value={slide.titleHighlight}
                          onChange={(e) => handleSlideChange(idx, 'titleHighlight', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                          placeholder="e.g. Confidence"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Title End</label>
                        <input
                          type="text"
                          value={slide.titleEnd}
                          onChange={(e) => handleSlideChange(idx, 'titleEnd', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                          placeholder="e.g. Examinations"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                      <textarea
                        value={slide.desc}
                        onChange={(e) => handleSlideChange(idx, 'desc', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                        placeholder="Slide description text"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">CTA Button Text</label>
                        <input
                          type="text"
                          value={slide.ctaText}
                          onChange={(e) => handleSlideChange(idx, 'ctaText', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                          placeholder="e.g. Get Started"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">CTA Link</label>
                        <input
                          type="text"
                          value={slide.ctaLink}
                          onChange={(e) => handleSlideChange(idx, 'ctaLink', e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                          placeholder="e.g. /programs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Founder Intro Tab */}
      {activeTab === 'founder' && (
        <div className="bg-white dark:bg-brand-darkGray rounded-3xl border border-gray-200/50 dark:border-gray-800/80 p-6 shadow-sm max-w-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center space-x-2">
              <Video className="h-4 w-4 text-brand-red" />
              <span>Introduction Video URL</span>
            </label>
            <input
              type="url"
              value={introVideoUrl}
              onChange={(e) => setIntroVideoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
              placeholder="https://example.com/video.mp4"
            />
            <p className="text-[10px] text-gray-400">Direct video URL or embed URL for the homepage founder intro video.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center space-x-2">
              <Quote className="h-4 w-4 text-brand-red" />
              <span>Founder Quote</span>
            </label>
            <textarea
              value={founderQuote}
              onChange={(e) => setFounderQuote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
              placeholder="Founder's inspirational quote..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Founder Name</label>
              <input
                type="text"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                placeholder="Founder's name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Founder Role / Title</label>
              <input
                type="text"
                value={founderRole}
                onChange={(e) => setFounderRole(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                placeholder="e.g. Founder & CEO"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Homepage Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HomepageMedia;
