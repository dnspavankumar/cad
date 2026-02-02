import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ModelContext } from './contexts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 encoded image
}

export default function AIChatPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const model = useContext(ModelContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateOpenSCAD = async (prompt: string, imageData?: string) => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    const userMessage: Message = { role: 'user', content: prompt, image: imageData };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Get current code from editor
      const currentCode = model?.source || '';
      const hasExistingCode = currentCode.trim().length > 0;

      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      // Create system prompt based on whether we're editing or creating
      const systemPrompt = hasExistingCode
        ? `You are an expert OpenSCAD code editor. The user has existing OpenSCAD code and wants to modify it.

CURRENT CODE:
\`\`\`openscad
${currentCode}
\`\`\`

CRITICAL RULES:
1. Generate ONLY the complete modified OpenSCAD code - no explanations, no markdown formatting, no comments outside the code
2. Keep all existing functionality unless specifically asked to change it
3. Make the requested modifications while maintaining code quality
4. Preserve variable names and module structure when possible
5. Add realistic details and proper proportions for new elements
6. Ensure the modified code will render without errors
7. If adding new features, integrate them seamlessly with existing code
${imageData ? '8. If an image is provided, analyze it and incorporate its features into the 3D model' : ''}

User's modification request: ${prompt}

Generate the complete modified OpenSCAD code now (just the code, nothing else):`
        : `You are an expert OpenSCAD code generator. Your task is to generate highly realistic, detailed, and functional OpenSCAD code based on user requests.

CRITICAL RULES:
1. Generate ONLY valid OpenSCAD code - no explanations, no markdown formatting, no comments outside the code
2. Make models as realistic and detailed as possible
3. Use proper dimensions and proportions
4. Include appropriate modules and functions for reusability
5. Use transformations (translate, rotate, scale) effectively
6. Add realistic details like rounded edges, proper curves, and fine features
7. Use variables for easy customization
8. Ensure the code is production-ready and will render without errors
${imageData ? '9. If an image is provided, analyze it carefully and create a 3D model that matches its shape, proportions, and features' : ''}

User request: ${prompt}

Generate the OpenSCAD code now (just the code, nothing else):`;

      // Build request parts
      const requestParts: any[] = [{ text: systemPrompt }];
      
      // Add image if provided
      if (imageData) {
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
        requestParts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: requestParts
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      // Extract code from markdown if present
      let code = generatedText;
      const codeBlockMatch = generatedText.match(/```(?:openscad)?\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        code = codeBlockMatch[1];
      }

      const assistantMessage: Message = { role: 'assistant', content: code };
      setMessages(prev => [...prev, assistantMessage]);

      // Insert the generated code into the editor
      if (model) {
        model.setSource(code);
      }

    } catch (error) {
      console.error('Error generating code:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate code. Please check your API key and try again.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      generateOpenSCAD(input.trim(), selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#0a0a0a'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #222222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <i className="pi pi-sparkles" style={{ fontSize: '1.2rem', color: '#ffffff' }}></i>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: '#ffffff' }}>AI Assistant</h3>
            {model?.source?.trim() && (
              <small style={{ color: '#666666', fontSize: '0.75rem' }}>
                Edit mode - I can modify your current model
              </small>
            )}
          </div>
        </div>
        <Button
          icon="pi pi-times"
          rounded
          text
          severity="secondary"
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff'
          }}
        />
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#141414',
          borderBottom: '1px solid #222222'
        }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
            Gemini API Key
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <InputTextarea
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              rows={2}
              style={{ 
                flex: 1, 
                fontSize: '0.85rem',
                backgroundColor: '#0f0f0f',
                border: '1px solid #222222',
                color: '#ffffff'
              }}
            />
            <Button
              icon="pi pi-check"
              onClick={saveApiKey}
              disabled={!apiKey.trim()}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                color: '#ffffff'
              }}
            />
          </div>
          <small style={{ display: 'block', marginTop: '0.5rem', color: '#666666' }}>
            Get your API key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
              Google AI Studio
            </a>
          </small>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: '#000000'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#666666',
            padding: '2rem 1rem'
          }}>
            <i className="pi pi-sparkles" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2, color: '#ffffff' }}></i>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#a0a0a0' }}>
              Ask me to generate or edit 3D models!
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
              Create: "Make a realistic car"<br />
              Edit: "Make the headlights round" or "Add a spare tire"
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: msg.role === 'user' ? '#ffffff' : '#141414',
              color: msg.role === 'user' ? '#000000' : '#ffffff',
              fontSize: '0.9rem',
              wordBreak: 'break-word',
              border: msg.role === 'user' ? 'none' : '1px solid #222222'
            }}>
              {msg.image && (
                <img 
                  src={msg.image} 
                  alt="Uploaded" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }} 
                />
              )}
              {msg.role === 'assistant' && msg.content.includes('Error:') ? (
                <span style={{ color: '#ff6b6b' }}>{msg.content}</span>
              ) : msg.role === 'assistant' ? (
                <pre style={{
                  margin: 0,
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#ffffff'
                }}>
                  {msg.content}
                </pre>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ProgressSpinner style={{ width: '30px', height: '30px' }} />
            <span style={{ fontSize: '0.9rem', color: '#666666' }}>
              Generating code...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #222222',
        backgroundColor: '#0a0a0a'
      }}>
        {selectedImage && (
          <div style={{
            marginBottom: '0.5rem',
            position: 'relative',
            display: 'inline-block'
          }}>
            <img 
              src={selectedImage} 
              alt="Selected" 
              style={{ 
                maxWidth: '150px', 
                maxHeight: '150px', 
                borderRadius: '4px',
                border: '1px solid #222222'
              }} 
            />
            <Button
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              onClick={removeImage}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                minWidth: '24px',
                backgroundColor: '#ff6b6b',
                color: '#ffffff'
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <Button
            icon="pi pi-image"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            tooltip="Upload image"
            tooltipOptions={{ position: 'top' }}
            style={{ 
              alignSelf: 'flex-end',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              color: '#ffffff'
            }}
          />
          <InputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={model?.source?.trim() ? "Ask me to modify the current model..." : "Describe what you want to create..."}
            rows={2}
            style={{ 
              flex: 1,
              backgroundColor: '#0f0f0f',
              border: '1px solid #222222',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            icon="pi pi-send"
            type="submit"
            disabled={!input.trim() || loading}
            style={{ 
              alignSelf: 'flex-end',
              backgroundColor: '#ffffff',
              border: 'none',
              color: '#000000'
            }}
          />
        </div>
        <small style={{ display: 'block', marginTop: '0.5rem', color: '#666666', fontSize: '0.8rem' }}>
          Press Enter to send, Shift+Enter for new line
        </small>
      </form>
    </div>
  );
}
