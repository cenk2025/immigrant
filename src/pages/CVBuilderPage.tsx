import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Save, Plus, Trash2, Upload, Camera, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import type { CVVersion, CVData } from '../lib/supabase';
import { EscoOccupationPicker } from '../components/EscoOccupationPicker';
import { EscoSkillPicker } from '../components/EscoSkillPicker';
import { CvSkillRecommendations } from '../components/CvSkillRecommendations';
import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable'; // Removed as we use manual layout now
import './CVBuilderPage.css';

const emptyCV: CVData = {
    profile: {
        full_name: '',
        email: '',
        phone: '',
        location: '',
        photo_url: '',
        summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
};

export const CVBuilderPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cvList, setCvList] = useState<CVVersion[]>([]);
    const [currentCV, setCurrentCV] = useState<CVData>(emptyCV);
    const [cvTitle, setCvTitle] = useState('My CV');
    const [currentCVId, setCurrentCVId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string>('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [aiImproving, setAiImproving] = useState(false);
    const [analyzingCV, setAnalyzingCV] = useState(false);
    const [cvAnalysis, setCvAnalysis] = useState<string | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadCVList = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('cv_versions')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (!error && data) {
            setCvList(data);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadCVList();
    }, [user, navigate, loadCVList]);

    const loadCV = (cv: CVVersion) => {
        setCurrentCV(cv.data);
        setCvTitle(cv.title);
        setCurrentCVId(cv.id);
    };

    const saveCV = async () => {
        if (!user) return;

        setSaving(true);

        try {
            let error;
            if (currentCVId) {
                // Update existing CV
                const result = await supabase
                    .from('cv_versions')
                    .update({
                        title: cvTitle,
                        data: currentCV,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', currentCVId);
                error = result.error;
            } else {
                // Create new CV
                const result = await supabase
                    .from('cv_versions')
                    .insert({
                        user_id: user.id,
                        title: cvTitle,
                        template: 'modern',
                        data: currentCV,
                    })
                    .select()
                    .single();

                if (result.data) {
                    setCurrentCVId(result.data.id);
                }
                error = result.error;
            }

            if (error) throw error;

            await loadCVList();
            alert('CV saved successfully!');

            // Trigger AI analysis after successful save
            analyzeCV().catch(console.error); // Run in background
        } catch (error) {
            console.error('Error saving CV:', error);
            alert(`Failed to save CV: ${(error as Error).message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const createNewCV = () => {
        setCurrentCV(emptyCV);
        setCvTitle('My CV');
        setCurrentCVId(null);
        setActiveSection('profile');
    };

    const deleteCV = async (id: string) => {
        if (!confirm('Are you sure you want to delete this CV?')) return;

        await supabase.from('cv_versions').delete().eq('id', id);

        if (currentCVId === id) {
            createNewCV();
        }

        await loadCVList();
    };

    const downloadPDF = async () => {
        const doc = new jsPDF();
        const margin = 20;
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (margin * 2);

        // Helper to check page break
        const checkPageBreak = (height: number) => {
            if (yPos + height > 280) {
                doc.addPage();
                yPos = 20;
                return true;
            }
            return false;
        };

        // Header Section
        // Photo
        if (currentCV.profile.photo_url) {
            try {
                // Fetch image (assuming cached or accessible URL)
                const img = new Image();
                img.src = currentCV.profile.photo_url;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                // Add circular or square image
                const imgSize = 30;
                doc.addImage(img, 'JPEG', pageWidth - margin - imgSize, yPos, imgSize, imgSize);
            } catch (e) {
                console.warn('Could not load profile image for PDF', e);
            }
        }

        // Name and Contact
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text(currentCV.profile.full_name || 'Your Name', margin, yPos + 10);
        yPos += 20;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const contactInfo = [
            currentCV.profile.email,
            currentCV.profile.phone,
            currentCV.profile.location
        ].filter(Boolean).join(' | ');

        doc.text(contactInfo, margin, yPos);
        yPos += 15;

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Professional Summary
        if (currentCV.profile.summary) {
            checkPageBreak(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80);
            doc.text('Professional Summary', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);

            const splitSummary = doc.splitTextToSize(currentCV.profile.summary, contentWidth);
            doc.text(splitSummary, margin, yPos);
            yPos += (splitSummary.length * 5) + 10;
        }

        // Work Experience (Manual Layout for reliability)
        if (currentCV.experience.length > 0) {
            checkPageBreak(25);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80);
            doc.text('Work Experience', margin, yPos);
            yPos += 10;

            currentCV.experience.forEach(exp => {
                checkPageBreak(25);

                // Title and Company
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                const titleText = `${exp.title} at ${exp.company}`;
                doc.text(titleText, margin, yPos);

                // Date
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                const dateText = `${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}`;
                const dateWidth = doc.getTextWidth(dateText);
                doc.text(dateText, pageWidth - margin - dateWidth, yPos);

                yPos += 6;

                // Description
                if (exp.description) {
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    const splitDesc = doc.splitTextToSize(exp.description, contentWidth);

                    // Check if description fits, if not page break
                    if (checkPageBreak(splitDesc.length * 5 + 5)) {
                        // If page break happened, reprint header? No, just print description on new page
                    }

                    doc.text(splitDesc, margin, yPos);
                    yPos += (splitDesc.length * 5) + 8;
                } else {
                    yPos += 4;
                }
            });
            yPos += 5; // Extra spacing after section
        }

        // Education (Manual Layout)
        if (currentCV.education.length > 0) {
            checkPageBreak(25);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80);
            doc.text('Education', margin, yPos);
            yPos += 10;

            currentCV.education.forEach(edu => {
                checkPageBreak(20);

                // Degree and Institution
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                const eduTitle = `${edu.degree}, ${edu.institution}`;
                doc.text(eduTitle, margin, yPos);

                // Date
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                const dateText = `${edu.start_date} - ${edu.current ? 'Present' : edu.end_date}`;
                const dateWidth = doc.getTextWidth(dateText);
                doc.text(dateText, pageWidth - margin - dateWidth, yPos);

                yPos += 6;

                if (edu.description) {
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    const splitDesc = doc.splitTextToSize(edu.description, contentWidth);
                    if (checkPageBreak(splitDesc.length * 5 + 5)) {
                        // page break handled
                    }
                    doc.text(splitDesc, margin, yPos);
                    yPos += (splitDesc.length * 5) + 8;
                } else {
                    yPos += 4;
                }
            });
            yPos += 5;
        }

        // Skills (Manual Layout)
        if (currentCV.skills.length > 0) {
            checkPageBreak(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80);
            doc.text('Skills', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            const skillsText = currentCV.skills.join('  •  ');
            const splitSkills = doc.splitTextToSize(skillsText, contentWidth);
            doc.text(splitSkills, margin, yPos);
            yPos += (splitSkills.length * 5) + 10;
        }

        // Languages (Manual Layout)
        if (currentCV.languages && currentCV.languages.length > 0) {
            checkPageBreak(25);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80);
            doc.text('Languages', margin, yPos);
            yPos += 8;

            currentCV.languages.forEach(lang => {
                const langText = `${lang.language} - ${lang.proficiency}`;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(langText, margin, yPos);
                yPos += 5;
            });
            yPos += 5;
        }

        doc.save(`${cvTitle || 'My_CV'}.pdf`);
    };

    const updateProfile = (field: string, value: string) => {
        setCurrentCV({
            ...currentCV,
            profile: { ...currentCV.profile, [field]: value },
        });
    };

    const addExperience = () => {
        setCurrentCV({
            ...currentCV,
            experience: [
                ...currentCV.experience,
                {
                    id: Date.now().toString(),
                    title: '',
                    company: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    current: false,
                    description: '',
                },
            ],
        });
    };

    const updateExperience = (id: string, field: string, value: string | boolean | undefined) => {
        setCurrentCV({
            ...currentCV,
            experience: currentCV.experience.map((exp) =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        });
    };

    const removeExperience = (id: string) => {
        setCurrentCV({
            ...currentCV,
            experience: currentCV.experience.filter((exp) => exp.id !== id),
        });
    };

    const addEducation = () => {
        setCurrentCV({
            ...currentCV,
            education: [
                ...currentCV.education,
                {
                    id: Date.now().toString(),
                    degree: '',
                    institution: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    current: false,
                    description: '',
                },
            ],
        });
    };

    const updateEducation = (id: string, field: string, value: string | boolean) => {
        setCurrentCV({
            ...currentCV,
            education: currentCV.education.map((edu) =>
                edu.id === id ? { ...edu, [field]: value } : edu
            ),
        });
    };

    const removeEducation = (id: string) => {
        setCurrentCV({
            ...currentCV,
            education: currentCV.education.filter((edu) => edu.id !== id),
        });
    };

    const [newSkill, setNewSkill] = useState('');

    const addSkill = () => {
        if (newSkill.trim()) {
            setCurrentCV({
                ...currentCV,
                skills: [...currentCV.skills, newSkill.trim()],
            });
            setNewSkill('');
        }
    };

    const removeSkill = (index: number) => {
        const removed = currentCV.skills[index];
        setCurrentCV({
            ...currentCV,
            skills: currentCV.skills.filter((_, i) => i !== index),
            // Drop any ESCO link for the removed skill label.
            skill_links: (currentCV.skill_links || []).filter((l) => l.label !== removed),
        });
    };

    // ── ESCO skill links (powers the recommendation engine's "already have" set) ──
    const setSkillLink = (label: string, skillUri: string | undefined) => {
        const others = (currentCV.skill_links || []).filter((l) => l.label !== label);
        setCurrentCV({
            ...currentCV,
            skill_links: skillUri ? [...others, { label, skill_uri: skillUri }] : others,
        });
    };

    // Add a recommended skill into the CV: append the label (if new) and record its link.
    const addRecommendedSkill = (label: string, skillUri: string) => {
        const hasLabel = currentCV.skills.includes(label);
        const others = (currentCV.skill_links || []).filter((l) => l.skill_uri !== skillUri);
        setCurrentCV({
            ...currentCV,
            skills: hasLabel ? currentCV.skills : [...currentCV.skills, label],
            skill_links: [...others, { label, skill_uri: skillUri }],
        });
    };

    const [newLanguage, setNewLanguage] = useState('');
    const [newLanguageLevel, setNewLanguageLevel] = useState('Intermediate');

    // Add known language typing here by creating a constant or type if needed, 
    // but for now we'll stick to string as per CVData interface likely assumption.
    const addLanguage = () => {
        if (newLanguage.trim()) {
            setCurrentCV({
                ...currentCV,
                languages: [
                    ...(currentCV.languages || []),
                    {
                        id: Date.now().toString(),
                        language: newLanguage.trim(),
                        proficiency: newLanguageLevel as 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic'
                    }
                ],
            });
            setNewLanguage('');
            setNewLanguageLevel('Intermediate');
        }
    };

    const removeLanguage = (index: number) => {
        setCurrentCV({
            ...currentCV,
            languages: (currentCV.languages || []).filter((_, i) => i !== index),
        });
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        setUploadingPhoto(true);

        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateProfile('photo_url', base64String);
                setUploadingPhoto(false);
            };
            reader.onerror = () => {
                alert('Error reading file');
                setUploadingPhoto(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload photo');
            setUploadingPhoto(false);
        }
    };

    const improveWithAI = async (field: 'summary' | 'experience' | 'education', itemId?: string) => {
        setAiImproving(true);

        try {
            const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
            if (!apiKey) {
                alert('AI feature is not configured');
                setAiImproving(false);
                return;
            }

            let currentText = '';
            let prompt = '';

            if (field === 'summary') {
                currentText = currentCV.profile.summary || '';
                prompt = `Improve this professional CV summary to make it more compelling and professional for the Finnish job market. Keep it concise (2-3 sentences) and highlight key strengths:\n\n${currentText}`;
            } else if (field === 'experience' && itemId) {
                const exp = currentCV.experience.find(e => e.id === itemId);
                if (exp) {
                    currentText = exp.description;
                    prompt = `Improve this work experience description for a CV. Make it achievement-focused, use action verbs, and quantify results where possible. Keep it professional and concise:\n\nJob Title: ${exp.title}\nCompany: ${exp.company}\nDescription: ${currentText}`;
                }
            }

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional CV writing expert. Provide improved, professional text that is suitable for Finnish job market. Return only the improved text without explanations or quotation marks.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                throw new Error('AI service error');
            }

            const data = await response.json();
            const improvedText = data.choices[0]?.message?.content?.trim() || currentText;

            // Update the appropriate field
            if (field === 'summary') {
                updateProfile('summary', improvedText);
            } else if (field === 'experience' && itemId) {
                updateExperience(itemId, 'description', improvedText);
            }

            setAiImproving(false);
        } catch (error) {
            console.error('AI improvement error:', error);
            alert('Failed to improve text with AI. Please try again.');
            setAiImproving(false);
        }
    };

    const analyzeCV = async () => {
        setAnalyzingCV(true);
        setCvAnalysis(null);

        try {
            const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
            if (!apiKey) {
                alert('AI feature is not configured');
                setAnalyzingCV(false);
                return;
            }

            // Prepare CV summary for analysis
            const cvSummary = {
                profile: {
                    name: currentCV.profile.full_name,
                    summary: currentCV.profile.summary,
                    hasPhoto: !!currentCV.profile.photo_url,
                },
                experience: currentCV.experience.map(exp => ({
                    title: exp.title,
                    company: exp.company,
                    duration: `${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}`,
                    description: exp.description,
                })),
                education: currentCV.education.map(edu => ({
                    degree: edu.degree,
                    institution: edu.institution,
                    duration: `${edu.start_date} - ${edu.current ? 'Present' : edu.end_date}`,
                })),
                skills: currentCV.skills,
                languages: currentCV.languages,
                certifications: currentCV.certifications,
            };

            const prompt = `As a professional CV expert for the Finnish job market, analyze this CV and provide specific, actionable recommendations:

CV Summary:
${JSON.stringify(cvSummary, null, 2)}

Please provide:
1. **Overall Assessment** (1-2 sentences on strengths)
2. **Key Improvements Needed** (3-5 specific points)
3. **Finnish Market Fit** (How well does this CV suit Finnish employers?)
4. **Missing Elements** (What should be added?)
5. **Quick Wins** (2-3 easy improvements that would make a big impact)

Keep your response concise, professional, and actionable. Focus on practical advice.`;

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert CV consultant specializing in the Finnish job market. Provide clear, actionable feedback that helps job seekers improve their CVs. Be encouraging but honest.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                }),
            });

            if (!response.ok) {
                throw new Error('AI service error');
            }

            const data = await response.json();
            const analysis = data.choices[0]?.message?.content?.trim() || 'Unable to analyze CV at this time.';

            setCvAnalysis(analysis);
            setShowAnalysisModal(true);
            setAnalyzingCV(false);
        } catch (error) {
            console.error('CV analysis error:', error);
            alert('Failed to analyze CV. Please try again.');
            setAnalyzingCV(false);
        }
    };

    if (!user) return null;

    return (
        <div className="cv-builder-page">
            <div className="cv-builder-container">
                {/* Sidebar with CV List */}
                <aside className="cv-sidebar">
                    <div className="cv-sidebar-header">
                        <h3>{t('dashboard.myCVs')}</h3>
                        <button onClick={createNewCV} className="btn btn-primary btn-sm">
                            <Plus size={16} />
                            New CV
                        </button>
                    </div>

                    <div className="cv-list">
                        {loading ? (
                            <p>Loading...</p>
                        ) : cvList.length === 0 ? (
                            <p className="cv-list-empty">No CVs yet. Create your first one!</p>
                        ) : (
                            cvList.map((cv) => (
                                <div
                                    key={cv.id}
                                    className={`cv-list-item ${currentCVId === cv.id ? 'active' : ''}`}
                                    onClick={() => loadCV(cv)}
                                >
                                    <FileText size={20} />
                                    <div className="cv-list-item-info">
                                        <h4>{cv.title}</h4>
                                        <p>{new Date(cv.updated_at).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCV(cv.id);
                                        }}
                                        className="cv-list-item-delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Editor */}
                <main className="cv-editor">
                    <div className="cv-editor-header">
                        <input
                            type="text"
                            value={cvTitle}
                            onChange={(e) => setCvTitle(e.target.value)}
                            className="cv-title-input"
                            placeholder="CV Title"
                        />
                        <div className="cv-editor-actions">
                            <button onClick={saveCV} className="btn btn-primary" disabled={saving || analyzingCV}>
                                <Save size={18} />
                                {analyzingCV ? 'Analyzing...' : saving ? 'Saving...' : t('common.save')}
                            </button>
                            <button onClick={downloadPDF} className="btn btn-secondary">
                                <Download size={18} />
                                {t('cvBuilder.download')}
                            </button>
                        </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="cv-sections-tabs">
                        {['profile', 'experience', 'education', 'skills'].map((section) => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`cv-section-tab ${activeSection === section ? 'active' : ''}`}
                            >
                                {t(`cvBuilder.sections.${section}`)}
                            </button>
                        ))}
                    </div>

                    {/* Section Content */}
                    <div className="cv-section-content">
                        {activeSection === 'profile' && (
                            <div className="cv-form">
                                <h3>Profile Information</h3>

                                {/* Photo Upload */}
                                <div className="form-group">
                                    <label className="label">Profile Photo</label>
                                    <div className="photo-upload-container">
                                        {currentCV.profile.photo_url ? (
                                            <div className="photo-preview">
                                                <img src={currentCV.profile.photo_url} alt="Profile" />
                                                <button
                                                    onClick={() => updateProfile('photo_url', '')}
                                                    className="photo-remove-btn"
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="photo-upload-placeholder">
                                                <Camera size={48} />
                                                <p>Add your professional photo</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="photo-input"
                                            id="photo-upload"
                                        />
                                        <label htmlFor="photo-upload" className="btn btn-secondary btn-sm">
                                            <Upload size={16} />
                                            {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                        </label>
                                    </div>
                                    <p className="form-hint">Recommended: Professional headshot, max 2MB</p>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Full Name</label>
                                        <input
                                            type="text"
                                            value={currentCV.profile.full_name}
                                            onChange={(e) => updateProfile('full_name', e.target.value)}
                                            className="input"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Email</label>
                                        <input
                                            type="email"
                                            value={currentCV.profile.email}
                                            onChange={(e) => updateProfile('email', e.target.value)}
                                            className="input"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Phone</label>
                                        <input
                                            type="tel"
                                            value={currentCV.profile.phone}
                                            onChange={(e) => updateProfile('phone', e.target.value)}
                                            className="input"
                                            placeholder="+358 40 123 4567"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Location</label>
                                        <input
                                            type="text"
                                            value={currentCV.profile.location}
                                            onChange={(e) => updateProfile('location', e.target.value)}
                                            className="input"
                                            placeholder="Helsinki, Finland"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="label-with-ai">
                                        <label className="label">Professional Summary</label>
                                        <button
                                            onClick={() => improveWithAI('summary')}
                                            className="btn btn-ai btn-sm"
                                            disabled={aiImproving || !currentCV.profile.summary}
                                            type="button"
                                        >
                                            <Sparkles size={16} />
                                            {aiImproving ? 'Improving...' : 'Improve with AI'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={currentCV.profile.summary}
                                        onChange={(e) => updateProfile('summary', e.target.value)}
                                        className="textarea"
                                        rows={5}
                                        placeholder="Brief summary of your professional background and career goals..."
                                    />
                                    <p className="form-hint">Write a brief summary, then click "Improve with AI" for professional enhancement</p>
                                </div>
                            </div>
                        )}

                        {activeSection === 'experience' && (
                            <div className="cv-form">
                                <div className="cv-form-header">
                                    <h3>Work Experience</h3>
                                    <button onClick={addExperience} className="btn btn-primary btn-sm">
                                        <Plus size={16} />
                                        Add Experience
                                    </button>
                                </div>
                                {currentCV.experience.map((exp) => (
                                    <div key={exp.id} className="cv-item-card">
                                        <div className="cv-item-header">
                                            <h4>Experience Entry</h4>
                                            <button
                                                onClick={() => removeExperience(exp.id)}
                                                className="btn-icon-danger"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="label">Job Title</label>
                                                <input
                                                    type="text"
                                                    value={exp.title}
                                                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                    className="input"
                                                    placeholder="Software Developer"
                                                />
                                                <EscoOccupationPicker
                                                    seedTitle={exp.title}
                                                    value={exp.esco_occupation_uri}
                                                    onChange={(uri) => updateExperience(exp.id, 'esco_occupation_uri', uri)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Company</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                    className="input"
                                                    placeholder="Company Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="label">Start Date</label>
                                                <input
                                                    type="month"
                                                    value={exp.start_date}
                                                    onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)}
                                                    className="input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">End Date</label>
                                                <input
                                                    type="month"
                                                    value={exp.end_date}
                                                    onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)}
                                                    className="input"
                                                    disabled={exp.current}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.current}
                                                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                />
                                                Currently working here
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <div className="label-with-ai">
                                                <label className="label">Description</label>
                                                <button
                                                    onClick={() => improveWithAI('experience', exp.id)}
                                                    className="btn btn-ai btn-sm"
                                                    disabled={aiImproving || !exp.description}
                                                    type="button"
                                                >
                                                    <Sparkles size={16} />
                                                    {aiImproving ? 'Improving...' : 'Improve with AI'}
                                                </button>
                                            </div>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                className="textarea"
                                                rows={4}
                                                placeholder="Describe your responsibilities and achievements..."
                                            />
                                            <p className="form-hint">Describe your role, then use AI to make it achievement-focused</p>
                                        </div>
                                    </div>
                                ))}
                                {currentCV.experience.length === 0 && (
                                    <p className="empty-state">No work experience added yet.</p>
                                )}
                            </div>
                        )}

                        {activeSection === 'education' && (
                            <div className="cv-form">
                                <div className="cv-form-header">
                                    <h3>Education</h3>
                                    <button onClick={addEducation} className="btn btn-primary btn-sm">
                                        <Plus size={16} />
                                        Add Education
                                    </button>
                                </div>
                                {currentCV.education.map((edu) => (
                                    <div key={edu.id} className="cv-item-card">
                                        <div className="cv-item-header">
                                            <h4>Education Entry</h4>
                                            <button
                                                onClick={() => removeEducation(edu.id)}
                                                className="btn-icon-danger"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="label">Degree</label>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                    className="input"
                                                    placeholder="Bachelor of Science"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Institution</label>
                                                <input
                                                    type="text"
                                                    value={edu.institution}
                                                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                    className="input"
                                                    placeholder="University Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="label">Start Date</label>
                                                <input
                                                    type="month"
                                                    value={edu.start_date}
                                                    onChange={(e) => updateEducation(edu.id, 'start_date', e.target.value)}
                                                    className="input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">End Date</label>
                                                <input
                                                    type="month"
                                                    value={edu.end_date}
                                                    onChange={(e) => updateEducation(edu.id, 'end_date', e.target.value)}
                                                    className="input"
                                                    disabled={edu.current}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={edu.current}
                                                    onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                                                />
                                                Currently studying
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                {currentCV.education.length === 0 && (
                                    <p className="empty-state">No education added yet.</p>
                                )}
                            </div>
                        )}



                        {activeSection === 'skills' && (
                            <div className="cv-form">
                                <div className="cv-form-header">
                                    <h3>Skills</h3>
                                </div>
                                <div className="skills-input-container">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                        className="input"
                                        placeholder="Enter a skill (e.g. JavaScript, Project Management)"
                                    />
                                    <button onClick={addSkill} className="btn btn-primary" disabled={!newSkill.trim()}>
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                                <div className="skills-grid">
                                    {currentCV.skills.map((skill, index) => (
                                        <div key={index} className="skill-tag">
                                            <span>{skill}</span>
                                            <button onClick={() => removeSkill(index)} className="skill-remove">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {currentCV.skills.length === 0 && (
                                    <p className="empty-state">No skills added yet.</p>
                                )}

                                {/* Optional: link existing free-text skills to ESCO so the
                                    recommendation engine knows what the user already has. */}
                                {currentCV.skills.length > 0 && (
                                    <div className="esco-link-skills">
                                        {currentCV.skills.map((skill, index) => (
                                            <div key={index} className="esco-link-skill-row">
                                                <span className="esco-link-skill-name">{skill}</span>
                                                <EscoSkillPicker
                                                    seedText={skill}
                                                    value={(currentCV.skill_links || []).find((l) => l.label === skill)?.skill_uri}
                                                    onChange={(uri) => setSkillLink(skill, uri)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* History-based recommendations */}
                                <CvSkillRecommendations
                                    experience={currentCV.experience}
                                    skillLinks={currentCV.skill_links || []}
                                    onAdd={addRecommendedSkill}
                                />

                                <div className="cv-form-header" style={{ marginTop: '2rem' }}>
                                    <h3>Languages</h3>
                                </div>
                                <div className="skills-input-container">
                                    <input
                                        type="text"
                                        value={newLanguage}
                                        onChange={(e) => setNewLanguage(e.target.value)}
                                        className="input"
                                        placeholder="Enter a language (e.g. Finnish, English)"
                                        style={{ flex: 2 }}
                                    />
                                    <select
                                        value={newLanguageLevel}
                                        onChange={(e) => setNewLanguageLevel(e.target.value)}
                                        className="input"
                                        style={{ flex: 1 }}
                                    >
                                        <option value="Native">Native</option>
                                        <option value="Fluent">Fluent</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Basic">Basic</option>
                                    </select>
                                    <button onClick={addLanguage} className="btn btn-primary" disabled={!newLanguage.trim()}>
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                                <div className="skills-grid">
                                    {(currentCV.languages || []).map((lang, index) => (
                                        <div key={index} className="skill-tag language-tag">
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 'bold' }}>{lang.language}</span>
                                                <span style={{ fontSize: '0.8em', opacity: 0.8 }}>{lang.proficiency}</span>
                                            </div>
                                            <button onClick={() => removeLanguage(index)} className="skill-remove">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {(!currentCV.languages || currentCV.languages.length === 0) && (
                                    <p className="empty-state">No languages added yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* AI Analysis Modal */}
            {showAnalysisModal && cvAnalysis && (
                <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
                    <div className="modal-content cv-analysis-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon">
                                <Sparkles size={24} />
                            </div>
                            <h2>AI CV Analysis</h2>
                            <button
                                onClick={() => setShowAnalysisModal(false)}
                                className="modal-close-btn"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="analysis-content">
                                {cvAnalysis.split('\n').map((line, index) => {
                                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                                        // Bold headers
                                        return (
                                            <h3 key={index} className="analysis-section-title">
                                                {line.replace(/\*\*/g, '')}
                                            </h3>
                                        );
                                    } else if (line.trim().match(/^\d+\./)) {
                                        // Numbered lists
                                        return (
                                            <p key={index} className="analysis-list-item">
                                                {line}
                                            </p>
                                        );
                                    } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                                        // Bullet points
                                        return (
                                            <p key={index} className="analysis-bullet">
                                                {line}
                                            </p>
                                        );
                                    } else if (line.trim()) {
                                        // Regular paragraphs
                                        return (
                                            <p key={index} className="analysis-paragraph">
                                                {line}
                                            </p>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setShowAnalysisModal(false)}
                                className="btn btn-primary"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
