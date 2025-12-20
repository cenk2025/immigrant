import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import './AssistantPage.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AssistantPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Add welcome message
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `Hello! I'm your WorkLife IQ Finland assistant. I can help you with:

• Understanding Finnish work culture and expectations
• Writing and improving your CV
• Job searching strategies in Finland
• Employment rights and regulations
• Career development advice

How can I assist you today?`,
                timestamp: new Date(),
            },
        ]);
    }, [user, navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful career assistant for WorkLife IQ Finland, a platform helping immigrants integrate into Finnish working life. 

Your role is to:
- Provide accurate information about Finnish work culture, employment laws, and career development
- Help users understand Finnish workplace norms and expectations
- Offer guidance on CV writing and job searching in Finland
- Be supportive, professional, and culturally sensitive
- Never provide legal advice or make immigration decisions
- Encourage users to consult qualified professionals for legal matters

Keep responses clear, concise, and actionable. Use a friendly but professional tone.`,
                        },
                        ...messages.map((msg) => ({
                            role: msg.role,
                            content: msg.content,
                        })),
                        {
                            role: 'user',
                            content: input,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from assistant');
            }

            const data = await response.json();
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!user) return null;

    return (
        <div className="assistant-page">
            <div className="assistant-container">
                {/* Header */}
                <div className="assistant-header">
                    <div className="assistant-header-icon">
                        <Bot size={32} />
                    </div>
                    <div>
                        <h1>{t('assistant.title')}</h1>
                        <p>Your AI-powered career companion for Finland</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="messages-container">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                        >
                            <div className="message-icon">
                                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="message-content">
                                <div className="message-text">{message.content}</div>
                                <div className="message-time">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message message-assistant">
                            <div className="message-icon">
                                <Bot size={20} />
                            </div>
                            <div className="message-content">
                                <div className="message-loading">
                                    <Loader size={20} className="spinner-icon" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer */}
                <div className="assistant-disclaimer">
                    <p>{t('assistant.disclaimer')}</p>
                </div>

                {/* Input */}
                <div className="assistant-input-container">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('assistant.placeholder')}
                        className="assistant-input"
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="btn btn-primary assistant-send-btn"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
