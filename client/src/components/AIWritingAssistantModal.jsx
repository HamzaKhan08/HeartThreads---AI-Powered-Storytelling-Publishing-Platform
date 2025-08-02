import React, { useState, useEffect } from 'react';
import { generatePrompts, generateStory, getAIStatus } from '../api';
import { emotionalTones, writingStyles, lengthOptions } from '../constants/aiOptions';

const AIWritingAssistantModal = ({ open, onClose }) => {
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [length, setLength] = useState(1); // Default to short story length
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [progressStage, setProgressStage] = useState(0);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [currentModel, setCurrentModel] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState("");

  // Check AI service status on component mount
  useEffect(() => {
    if (open) {
      checkAIStatus();
    }
  }, [open]);

  const checkAIStatus = async () => {
    try {
      const response = await getAIStatus();
      setAiStatus(response);
      if (response.success && response.model) {
        setCurrentModel(response.model);
      }
    } catch (error) {
      console.error('Error checking AI status:', error);
      setAiStatus({ success: false, status: 'unavailable' });
    }
  };

  const handleGeneratePrompts = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first!");
      return;
    }
    if (!selectedTone) {
      setError("Please select an emotional tone!");
      return;
    }
    if (!selectedStyle) {
      setError("Please select a writing style!");
      return;
    }

    setIsGenerating(true);
    setError("");
    setProgressStage(0);
    setProgressPercentage(0);
    setGenerationProgress("Initializing fast AI models...");

    try {
      // Progress callback for real-time updates
      const onProgress = (progressData) => {
        setProgressStage(progressData.stage);
        setGenerationProgress(progressData.message);
        setProgressPercentage(Math.min((progressData.stage / 5) * 100, 100));
      };

      const response = await generatePrompts({
        topic,
        emotionalTone: selectedTone,
        writingStyle: selectedStyle
      }, onProgress);

      if (response.success) {
        setGenerationProgress("Prompts generated successfully!");
        setProgressPercentage(100);
        setGeneratedPrompts(response.prompts);
        setShowPrompts(true);
        showNotification(`Prompts generated successfully using ${currentModel}!`, "success");
      } else {
        setError(response.message || "Failed to generate prompts");
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError("Failed to generate prompts. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
      setProgressPercentage(0);
    }
  };

  const handleGetStarted = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first!");
      return;
    }
    if (!selectedTone) {
      setError("Please select an emotional tone!");
      return;
    }
    if (!selectedStyle) {
      setError("Please select a writing style!");
      return;
    }

    setIsGeneratingStory(true);
    setError("");
    setProgressStage(0);
    setProgressPercentage(0);
    setGenerationProgress("Initializing fast AI models...");
    setEstimatedTimeRemaining("");

    const startTime = Date.now();

    try {
      // Progress callback for real-time updates
      const onProgress = (progressData) => {
        setProgressStage(progressData.stage);
        setGenerationProgress(progressData.message);
        setProgressPercentage(Math.min((progressData.stage / 9) * 100, 100));
        
        // Calculate estimated time remaining
        const elapsed = Date.now() - startTime;
        const avgTimePerStage = elapsed / progressData.stage;
        const remainingStages = 9 - progressData.stage;
        const estimatedRemaining = Math.round((avgTimePerStage * remainingStages) / 1000);
        
        if (estimatedRemaining > 0) {
          setEstimatedTimeRemaining(`${estimatedRemaining}s remaining`);
        }
      };

      const response = await generateStory({
        topic,
        emotionalTone: selectedTone,
        writingStyle: selectedStyle,
        length
      }, onProgress);

      if (response.success) {
        setGenerationProgress("Story generated successfully!");
        setProgressPercentage(100);
        setEstimatedTimeRemaining("");
        setGeneratedStory(response.story);
        const modelUsed = response.story.model || currentModel;
        showNotification(`Story generated successfully using ${modelUsed}!`, "success");
      } else {
        setError(response.message || "Failed to generate story");
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setError("Failed to generate story. Please try again.");
    } finally {
      setIsGeneratingStory(false);
      setGenerationProgress("");
      setProgressPercentage(0);
      setEstimatedTimeRemaining("");
    }
  };

  const handlePromptSelect = (prompt) => {
    setTopic(prompt);
    setShowPrompts(false);
    showNotification("Prompt selected!", "success");
  };

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="ai-assistant-modal bg-white rounded-xl shadow-xl w-full max-w-7xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <i className="ri-robot-line text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-xl">Ollama Writing Assistant</h3>
              <p className="text-sm text-gray-600">Let Ollama help you craft your story</p>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-6">
          {/* Notification Popup */}
          {notification.show && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}>
              <div className="flex items-center space-x-2">
                <i className={`ri-${notification.type === 'success' ? 'check' : notification.type === 'error' ? 'close' : 'information'}-line`}></i>
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          )}

          {/* AI Status */}
          {aiStatus && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              aiStatus.success && aiStatus.status === 'available' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className={`ri-${aiStatus.success && aiStatus.status === 'available' ? 'check' : 'close'}-line`}></i>
                  <span>{aiStatus.message}</span>
                </div>
                {aiStatus.success && aiStatus.workingModels && (
                  <div className="text-xs text-green-600 font-mono">
                    Models: {aiStatus.workingModels.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </div>
            </div>
          )}           

          {/* Topic Input */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              What would you like to write about?
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic, emotion, or experience..."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-700"
              />
              {topic && (
                <button
                  onClick={() => setTopic("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line"></i>
                </button>
              )}
            </div>
          </div>
          {/* Emotional Tone */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Emotional Tone
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {emotionalTones.map((tone) => (
                <button
                  key={tone.name}
                  onClick={() => setSelectedTone(tone.name)}
                  className={`tag-chip px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedTone === tone.name
                      ? `bg-${tone.color}-100 text-${tone.color}-700 border-2 border-${tone.color}-300`
                      : `bg-${tone.color}-50 text-${tone.color}-600 hover:bg-${tone.color}-100`
                  }`}
                >
                  <span>{tone.emoji}</span>
                  <span>{tone.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Writing Style */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Writing Style
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {writingStyles.map((style) => (
                <div key={style.id} className="relative">
                  <input
                    type="radio"
                    id={style.id}
                    name="writing-style"
                    className="peer sr-only"
                    checked={selectedStyle === style.name}
                    onChange={() => setSelectedStyle(style.name)}
                  />
                  <label
                    htmlFor={style.id}
                    className="block p-4 bg-gray-50 rounded-lg border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{style.icon}</span>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-sm text-gray-500">
                          {style.description}
                        </div>
                      </div>
                    </div>
                    <div className="absolute hidden peer-checked:block top-3 right-3 text-primary">
                      <i className="ri-check-line text-xl"></i>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Length Slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="block text-gray-700 font-medium">
                Story Length
              </label>
              <span className="text-gray-500 text-sm">
                {lengthOptions.find((opt) => opt.value === length)?.words}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="3"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {lengthOptions.map((option) => (
                  <span
                    key={option.value}
                    className={
                      length === option.value
                        ? "text-primary font-medium"
                        : ""
                    }
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Generated Prompts */}
          {showPrompts && generatedPrompts.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">
                AI Generated Story Ideas ({generatedPrompts.length}):
              </h4>
              <div className="space-y-2">
                {generatedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    className="block w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-blue-700"
                  >
                    <div className="flex items-center justify-between">
                      <span>{prompt}</span>
                      <i className="ri-arrow-right-line text-blue-400"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              onClick={handleGeneratePrompts}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>AI is thinking...</span>
                </>
              ) : (
                <>
                  <i className="ri-magic-line"></i>
                  <span>Generate Prompts</span>
                </>
              )}
            </button>
            <button
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
              onClick={handleGetStarted}
              disabled={isGeneratingStory}
            >
              {isGeneratingStory ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Generating Story...</span>
                </>
              ) : (
                <>
                  <i className="ri-arrow-right-line"></i>
                  <span>Generate Story</span>
                </>
              )}
            </button>
          </div>
          
          {/* Enhanced AI Model Status for Prompts */}
          {isGenerating && (
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-700">{generationProgress || "Initializing AI models..."}</span>
                </div>
                <span className="text-xs text-blue-600 font-mono">
                  {currentModel ? currentModel.split(':')[0] : 'llama3.1:8b, deepseek-r1'}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{width: `${progressPercentage}%`}}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-600">
                <span>Stage {progressStage}/5</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
            </div>
          )}
          
          {/* Enhanced Generation Progress for Story */}
          {isGeneratingStory && generationProgress && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-700">{generationProgress}</span>
                </div>
                <span className="text-xs text-blue-600 font-mono">
                  {currentModel ? currentModel.split(':')[0] : 'llama3.1:8b, deepseek-r1'}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{width: `${progressPercentage}%`}}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-600">
                <span>Stage {progressStage}/9</span>
                <span>{Math.round(progressPercentage)}% complete</span>
                {estimatedTimeRemaining && (
                  <span className="text-blue-500">{estimatedTimeRemaining}</span>
                )}
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Target length: {lengthOptions.find((opt) => opt.value === length)?.words} • 
                Estimated time: {length === 1 ? '15-25 seconds' : length === 2 ? '20-35 seconds' : '30-45 seconds'}
              </div>
            </div>
          )}

          {/* Spacing between sections */}
          <div className="h-8"></div>
          {/* Enhanced Generated Story Display */}
          {generatedStory && (
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg overflow-hidden">
              {/* Story Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="ri-book-open-line text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Your Generated Story</h4>
                      <p className="text-blue-100 text-sm">Ollama-powered creative writing</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGeneratedStory(null)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {/* Story Title and Meta */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
                    <h5 className="font-bold text-xl text-gray-800 mb-2">{generatedStory.title}</h5>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <i className="ri-file-text-line"></i>
                        <span>{generatedStory.wordCount} words</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="ri-time-line"></i>
                        <span>{generatedStory.estimatedReadTime} min read</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="ri-robot-line"></i>
                        <span>Ollama Generated</span>
                      </div>
                      {generatedStory.completeness && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-check-line"></i>
                          <span>{generatedStory.completeness}% complete</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Text */}
                  <div className="p-6">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {generatedStory.content}
                    </div>
                  </div>
                </div>

                {/* AI Feedback Section */}
                {generatedStory.aiFeedback && (
                  <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="flex items-center mb-2">
                      <i className="ri-lightbulb-flash-line text-yellow-500 text-xl mr-2"></i>
                      <span className="font-semibold text-yellow-700">AI Feedback & Suggestions</span>
                    </div>
                    <div className="text-yellow-800 text-sm whitespace-pre-line">{generatedStory.aiFeedback}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(generatedStory.content);
                        showNotification("Story copied to clipboard!", "success");
                      } catch {
                        showNotification("Failed to copy story", "error");
                      }
                    }}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    <i className="ri-clipboard-line"></i>
                    <span>Copy Story</span>
                  </button>
                  <button
                    onClick={() => {
                      // Here you would typically save the story or navigate to edit page
                      console.log('Saving story:', generatedStory);
                      showNotification("Story saved successfully!", "success");
                    }}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    <i className="ri-save-line"></i>
                    <span>Save Story</span>
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedStory(null);
                      showNotification("Ready to generate new story!", "success");
                    }}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    <i className="ri-refresh-line"></i>
                    <span>Generate New</span>
                  </button>
                  <button
                    onClick={() => {
                      try {
                        // Download as text file
                        const blob = new Blob([generatedStory.content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showNotification("Story downloaded successfully!", "success");
                      } catch {
                        showNotification("Failed to download story", "error");
                      }
                    }}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                  >
                    <i className="ri-download-line"></i>
                    <span>Download</span>
                  </button>
                </div>

                {/* Story Stats */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-800">{generatedStory.wordCount}</div>
                      <div className="text-gray-600">Words</div>
                      {(() => {
                        const targetWords = length === 1 ? 800 : length === 2 ? 1200 : 1800;
                        const percentage = Math.round((generatedStory.wordCount / targetWords) * 100);
                        const isShort = percentage < 80;
                        return (
                          <div className={`text-xs mt-1 ${isShort ? 'text-orange-600' : 'text-green-600'}`}>
                            {percentage}% of target ({targetWords})
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{generatedStory.estimatedReadTime}</div>
                      <div className="text-gray-600">Min Read</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{Math.ceil(generatedStory.wordCount / 5)}</div>
                      <div className="text-gray-600">Sentences</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{Math.ceil(generatedStory.wordCount / 200)}</div>
                      <div className="text-gray-600">Paragraphs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Features */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <i className="ri-brain-line text-2xl text-primary mb-2"></i>
                <div className="text-sm font-medium">Local AI</div>
                <div className="text-xs text-gray-500">
                  Powered by Ollama
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <i className="ri-time-line text-2xl text-primary mb-2"></i>
                <div className="text-sm font-medium">Real-time Progress</div>
                <div className="text-xs text-gray-500">
                  Live generation updates
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <i className="ri-file-text-line text-2xl text-primary mb-2"></i>
                <div className="text-sm font-medium">Complete Stories</div>
                <div className="text-xs text-gray-500">
                  Title to conclusion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWritingAssistantModal; 