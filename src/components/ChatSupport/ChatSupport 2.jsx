import React, { useState, useEffect, useRef } from 'react';

export const ChatSupport = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setMessages([{
                type: 'bot',
                content: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?"
            }]);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            type: 'user',
            content: inputMessage.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setError(null);
        
        // Réponse automatique simple
        const botMessage = {
            type: 'bot',
            content: "Je suis désolé, je ne suis pas encore configuré pour répondre aux messages. Un agent vous contactera bientôt."
        };
        setMessages(prev => [...prev, botMessage]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-[100]">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
                <h2 className="text-lg font-semibold">Support Client</h2>
                <button 
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${
                            message.type === 'user' 
                                ? 'ml-auto text-right' 
                                : 'mr-auto'
                        }`}
                    >
                        <div
                            className={`inline-block p-3 rounded-lg ${
                                message.type === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : message.type === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tapez votre message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg ${
                            isLoading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white transition-colors`}
                    >
                        {isLoading ? 'Envoi...' : 'Envoyer'}
                    </button>
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>
        </div>
    );
};
