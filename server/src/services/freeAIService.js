const axios = require('axios');
require('dotenv').config();

class FreeAIService {
  constructor() {
    this.config = {
      baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b'
    };
    this.maxTokens = 2000; // Reduced for faster responses
    // Available models in order of speed preference (faster models first)
    this.availableModels = ['deepseek-r1:latest', 'llama3.1:8b'];
    this.fastModel = 'deepseek-r1:latest'; // Fastest model for quick responses
  }

  // Check if Ollama is available
  async checkOllamaStatus() {
    try {
      const response = await axios.get(`${this.config.baseURL}/api/tags`);
      return {
        available: true,
        models: response.data.models || []
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  // Generate story prompts using optimized fast prompts
  async generatePrompts(topic, emotionalTone, writingStyle) {
    // Try fast model first for speed
    try {
      console.log(`Trying fast model: ${this.fastModel} for prompt generation`);
      
      // Ultra-optimized prompts for speed
      const prompt = `5 story ideas about "${topic}": ${emotionalTone} tone, ${writingStyle} style. One per line, short:`;
      
      const response = await this.makeFastOllamaRequest(prompt, 150, this.fastModel);
      const prompts = response
        .split('\n')
        .filter(p => p.trim() && p.length > 8)
        .map(p => p.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);

      if (prompts.length >= 3) {
        console.log(`Successfully generated prompts using fast model ${this.fastModel}`);
        return prompts;
      }
    } catch (error) {
      console.log(`Fast model failed, trying fallback: ${error.message}`);
    }

    // Fallback to other models if fast model fails
    for (const model of this.availableModels) {
      if (model === this.fastModel) continue; // Skip fast model as we already tried it
      
      try {
        console.log(`Trying model: ${model} for prompt generation`);
        
        // Optimized prompts for speed
        const prompt = `5 story ideas about "${topic}": ${emotionalTone} tone, ${writingStyle} style. Short, one per line:`;
        
        const response = await this.makeOllamaRequest(prompt, 200, model);
        const prompts = response
          .split('\n')
          .filter(p => p.trim() && p.length > 8)
          .map(p => p.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 5);

        if (prompts.length >= 3) {
          console.log(`Successfully generated prompts using ${model}`);
          return prompts;
        }
      } catch (error) {
        console.error(`Failed with model ${model}:`, error.message);
        continue;
      }
    }
    
    // Ultra-fast fallback prompts
    console.log('All models failed, using ultra-fast fallback prompts');
    return [
      `A ${emotionalTone} story about ${topic}`,
      `${topic} in ${writingStyle} style`,
      `The ${emotionalTone} journey of ${topic}`,
      `${writingStyle} tale of ${topic}`,
      `${topic} and ${emotionalTone} emotions`
    ];
  }

  // Generate a complete story with speed optimizations
  async generateStory(topic, emotionalTone, writingStyle, length, customPrompt = null) {
    const wordCount = this.getWordCount(length);
    
    // Try fast model first for speed
    try {
      console.log(`Trying fast model: ${this.fastModel} for story generation`);
      
      // Speed-optimized prompts
      let prompt;
      if (customPrompt) {
        prompt = customPrompt;
      } else {
        prompt = `Write a ${writingStyle.toLowerCase()} story about "${topic}" with ${emotionalTone.toLowerCase()} tone. 
Target: ${wordCount} words. Include title. Complete story with beginning, middle, end:`;
      }
      
      const estimatedTokens = Math.ceil(wordCount * 1.2); // Reduced token estimation
      const maxTokensForStory = Math.min(this.maxTokens, estimatedTokens);
      
      const story = await this.makeFastOllamaRequest(prompt, maxTokensForStory, this.fastModel);
      
      // Fast processing
      let cleanStory = story.trim();
      cleanStory = cleanStory.replace(/^(Here's|Here is|This is|I'll write|Let me write).*?:\s*/i, '');
      cleanStory = cleanStory.replace(/^(Title|Story):\s*/i, '');
      
      // Extract title quickly
      let title = '';
      let content = cleanStory;
      
      const titleMatch = cleanStory.match(/^["""]?([^"""]{3,40})["""]?\s*\n/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        content = cleanStory.substring(titleMatch[0].length).trim();
      } else {
        title = this.generateQuickTitle(topic, emotionalTone, writingStyle);
      }
      
      const finalWordCount = this.countWords(content);
      console.log(`Fast model generated: ${finalWordCount} words (target: ${wordCount})`);
      
      // Quick expansion if needed
      if (finalWordCount < wordCount * 0.6) {
        const remainingWords = wordCount - finalWordCount;
        const expansionPrompt = `Continue the story about "${topic}" to add ${remainingWords} more words. Continue from: "${content.slice(-50)}..."`;
        
        try {
          const expansion = await this.makeFastOllamaRequest(expansionPrompt, Math.min(500, remainingWords * 1.5), this.fastModel);
          content += ' ' + expansion.trim();
        } catch (error) {
          console.error('Failed to expand story:', error.message);
        }
      }
      
      // Quick AI feedback
      let aiFeedback = 'Story generated successfully. Consider adding more dialogue for enhancement.';
      
      const finalContent = content.trim();
      const finalWordCountFinal = this.countWords(finalContent);
      
      console.log(`Successfully generated story using fast model ${this.fastModel} - ${finalWordCountFinal} words`);
      
      return {
        title: title || this.generateQuickTitle(topic, emotionalTone, writingStyle),
        content: finalContent,
        wordCount: finalWordCountFinal,
        estimatedReadTime: Math.ceil(finalWordCountFinal / 200),
        provider: 'ollama',
        model: this.fastModel,
        aiFeedback,
        targetWords: wordCount,
        completeness: Math.round((finalWordCountFinal / wordCount) * 100)
      };
    } catch (error) {
      console.log(`Fast model failed, trying fallback models: ${error.message}`);
    }

    // Fallback to other models
    for (const model of this.availableModels) {
      if (model === this.fastModel) continue; // Skip fast model as we already tried it
      
      try {
        console.log(`Trying model: ${model} for story generation`);
        
        // Optimized prompts for speed
        let prompt;
        if (customPrompt) {
          prompt = customPrompt;
        } else {
          prompt = `Write a ${writingStyle.toLowerCase()} story about "${topic}" with ${emotionalTone.toLowerCase()} tone. 
Target: ${wordCount} words. Include title. Complete story:`;
        }
        
        const estimatedTokens = Math.ceil(wordCount * 1.2);
        const maxTokensForStory = Math.min(this.maxTokens, estimatedTokens);
        const story = await this.makeOllamaRequest(prompt, maxTokensForStory, model);
        
        // Fast processing
        let cleanStory = story.trim();
        cleanStory = cleanStory.replace(/^(Here's|Here is|This is|I'll write|Let me write).*?:\s*/i, '');
        cleanStory = cleanStory.replace(/^(Title|Story):\s*/i, '');
        
        // Extract title quickly
        let title = '';
        let content = cleanStory;
        
        const titleMatch = cleanStory.match(/^["""]?([^"""]{3,40})["""]?\s*\n/);
        if (titleMatch) {
          title = titleMatch[1].trim();
          content = cleanStory.substring(titleMatch[0].length).trim();
        } else {
          title = this.generateQuickTitle(topic, emotionalTone, writingStyle);
        }
        
        const finalWordCount = this.countWords(content);
        console.log(`Generated story: ${finalWordCount} words (target: ${wordCount})`);
        
        // Quick expansion if needed
        if (finalWordCount < wordCount * 0.6) {
          const remainingWords = wordCount - finalWordCount;
          const expansionPrompt = `Continue the story about "${topic}" to add ${remainingWords} more words. Continue from: "${content.slice(-50)}..."`;
          
          try {
            const expansion = await this.makeOllamaRequest(expansionPrompt, Math.min(500, remainingWords * 1.5), model);
            content += ' ' + expansion.trim();
          } catch (error) {
            console.error('Failed to expand story:', error.message);
          }
        }
        
        // Quick AI feedback
        let aiFeedback = 'Story generated successfully. Consider adding more dialogue for enhancement.';
        
        const finalContent = content.trim();
        const finalWordCountFinal = this.countWords(finalContent);
        
        console.log(`Successfully generated story using ${model} - ${finalWordCountFinal} words`);
        
        return {
          title: title || this.generateQuickTitle(topic, emotionalTone, writingStyle),
          content: finalContent,
          wordCount: finalWordCountFinal,
          estimatedReadTime: Math.ceil(finalWordCountFinal / 200),
          provider: 'ollama',
          model: model,
          aiFeedback,
          targetWords: wordCount,
          completeness: Math.round((finalWordCountFinal / wordCount) * 100)
        };
      } catch (error) {
        console.error(`Failed with model ${model}:`, error.message);
        continue;
      }
    }
    
    // Ultra-fast fallback story
    console.log('All models failed, generating ultra-fast fallback story');
    const fallbackStory = this.generateUltraFastFallbackStory(topic, emotionalTone, writingStyle, wordCount);
    const fallbackTitle = this.generateQuickTitle(topic, emotionalTone, writingStyle);
    return {
      title: fallbackTitle,
      content: fallbackStory,
      wordCount: this.countWords(fallbackStory),
      estimatedReadTime: Math.ceil(this.countWords(fallbackStory) / 200),
      provider: 'ollama',
      model: 'fallback',
      aiFeedback: 'Fast fallback story generated. Consider regenerating when AI models are available.',
      targetWords: wordCount,
      completeness: Math.round((this.countWords(fallbackStory) / wordCount) * 100)
    };
  }

  // Generate a quick title without AI call
  generateQuickTitle(topic, emotionalTone, writingStyle) {
    const quickTitles = {
      'romance': `The ${emotionalTone} Heart of ${topic}`,
      'mystery': `The ${emotionalTone} Mystery of ${topic}`,
      'adventure': `The ${emotionalTone} Adventure of ${topic}`,
      'fantasy': `The ${emotionalTone} Magic of ${topic}`,
      'drama': `The ${emotionalTone} Drama of ${topic}`,
      'narrative': `A ${emotionalTone} Tale of ${topic}`,
      'poetic': `The ${emotionalTone} Poetry of ${topic}`,
      'conversational': `Talking About ${topic}`,
      'reflective': `Reflections on ${topic}`,
      'journalistic': `The Story of ${topic}`,
      'stream of consciousness': `Thoughts on ${topic}`,
      'letter format': `A Letter About ${topic}`,
      'dialogue heavy': `Conversations About ${topic}`,
      'descriptive': `The ${emotionalTone} Beauty of ${topic}`,
      'analytical': `Analyzing ${topic}`,
      'confessional': `Confessions About ${topic}`,
      'satirical': `The ${emotionalTone} Comedy of ${topic}`,
      'minimalist': `${topic}`,
      'experimental': `Exploring ${topic}`,
      'academic': `A Study of ${topic}`,
      'creative nonfiction': `The True Story of ${topic}`,
      'fable-like': `The ${emotionalTone} Lesson of ${topic}`,
      'diary entry': `My ${emotionalTone} Thoughts on ${topic}`,
      'travelogue': `The ${emotionalTone} Journey of ${topic}`,
      'memoir style': `Memories of ${topic}`,
      'essay format': `An Essay on ${topic}`,
      'free verse': `The ${emotionalTone} Verse of ${topic}`,
      'haiku style': `Haiku for ${topic}`,
      'prose poetry': `The ${emotionalTone} Prose of ${topic}`
    };

    return quickTitles[writingStyle.toLowerCase()] || `A ${emotionalTone} Story About ${topic}`;
  }

  // Ultra-fast fallback story generator
  generateUltraFastFallbackStory(topic, emotionalTone, writingStyle, wordCount) {
    const baseStory = `# ${this.generateQuickTitle(topic, emotionalTone, writingStyle)}

In a world where ${topic} held meaning, a ${emotionalTone.toLowerCase()} story began to unfold. The ${writingStyle.toLowerCase()} narrative captured the essence of human experience, weaving together moments of joy, reflection, and discovery.

The characters in this tale found themselves drawn to ${topic}, each in their own unique way. Through their journey, they discovered that ${topic} was more than just a concept—it was a force that shaped destinies and transformed lives.

As the story progressed, the ${emotionalTone.toLowerCase()} nature of their experiences became clear. Every moment, every choice, every interaction was colored by the profound impact of ${topic}. The ${writingStyle.toLowerCase()} style of storytelling brought these moments to life, creating a vivid tapestry of emotion and meaning.

In the end, the tale of ${topic} revealed its true power. It wasn't just about the events that unfolded, but about the way those events changed the people involved. The ${emotionalTone.toLowerCase()} journey had transformed not just the characters, but the very fabric of their world.

And so, the story of ${topic} became a testament to the enduring power of human connection and the beauty of storytelling itself.`;

    let story = baseStory;
    
    // Quick expansion to reach target word count
    while (this.countWords(story) < wordCount * 0.8) {
      const expansion = `\n\nThe echoes of ${topic} continued to resonate, touching lives in ways both subtle and profound. Each moment brought new revelations and deeper understanding, as the ${emotionalTone.toLowerCase()} journey unfolded with ${writingStyle.toLowerCase()} grace.`;
      story += expansion;
    }
    
    return story;
  }

  // Fast Ollama request with optimized settings for speed
  async makeFastOllamaRequest(prompt, maxTokens = 500, model = null) {
    const modelToUse = model || this.fastModel;
    
    try {
      const response = await axios.post(`${this.config.baseURL}/api/generate`, {
        model: modelToUse,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: Math.min(maxTokens, 1000), // Reduced for speed
          temperature: 0.7, // Slightly lower for faster generation
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          stop: ['\n\n\n', '###', '---'], // Reduced stop tokens
          num_ctx: 2048 // Reduced context for speed
        }
      }, {
        timeout: 30000 // 30 second timeout for speed
      });

      return response.data.response;
    } catch (error) {
      console.error(`Fast Ollama request failed for ${modelToUse}:`, error.message);
      throw error;
    }
  }

  // Make Ollama request with optimized settings for speed
  async makeOllamaRequest(prompt, maxTokens = 1000, model = null) {
    const modelToUse = model || this.config.model;
    
    try {
      const response = await axios.post(`${this.config.baseURL}/api/generate`, {
        model: modelToUse,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: Math.min(maxTokens, 2000), // Reduced for speed
          temperature: 0.8,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          stop: ['\n\n\n', '###', '---'], // Reduced stop tokens
          num_ctx: 4096 // Reduced context for speed
        }
      }, {
        timeout: 60000 // 60 second timeout
      });

      return response.data.response;
    } catch (error) {
      console.error(`Ollama request failed for ${modelToUse}:`, error.message);
      throw error;
    }
  }

  // Check AI service status with speed optimization
  async checkStatus() {
    try {
      const ollamaStatus = await this.checkOllamaStatus();
      
      if (!ollamaStatus.available) {
        return {
          success: false,
          status: 'unavailable',
          provider: 'ollama',
          message: 'Ollama service is not available',
          model: null
        };
      }

      // Test fast model first
      let workingModels = [];
      let primaryModel = null;

      // Test fast model
      try {
        await this.makeFastOllamaRequest('test', 10, this.fastModel);
        workingModels.push(this.fastModel);
        primaryModel = this.fastModel;
      } catch (error) {
        console.log(`Fast model ${this.fastModel} not working:`, error.message);
      }

      // Test other models if fast model fails
      for (const model of this.availableModels) {
        if (model === this.fastModel) continue;
        
        try {
          await this.makeOllamaRequest('test', 10, model);
          workingModels.push(model);
          if (!primaryModel) {
            primaryModel = model;
          }
        } catch (error) {
          console.log(`Model ${model} not working:`, error.message);
        }
      }

      if (workingModels.length === 0) {
        return {
          success: false,
          status: 'unavailable',
          provider: 'ollama',
          message: 'No working AI models found',
          model: null
        };
      }

      return {
        success: true,
        status: 'available',
        provider: 'ollama',
        model: primaryModel,
        message: `AI service is available using Ollama with ${primaryModel}`,
        availableModels: this.availableModels,
        workingModels: workingModels,
        fastModel: this.fastModel
      };
    } catch (error) {
      console.error('Error checking AI status:', error);
      return {
        success: false,
        status: 'error',
        provider: 'ollama',
        message: 'Error checking AI service status',
        model: null
      };
    }
  }

  // Get word count based on length selection (optimized for better story generation)
  getWordCount(length) {
    switch (length) {
      case 1: return 800; // Short - substantial story
      case 2: return 1200; // Medium - full story
      case 3: return 1800; // Long - comprehensive story
      default: return 1000;
    }
  }

  // Count words in text
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  // Get style guide for different writing styles
  getStyleGuide(writingStyle) {
    const guides = {
      'Poetic': 'Use lyrical language, metaphors, and rhythmic prose. Focus on imagery and emotional resonance.',
      'Narrative': 'Tell a compelling story with clear plot progression, character development, and engaging dialogue.',
      'Conversational': 'Write in a casual, relatable tone as if speaking to a friend. Use natural dialogue and personal anecdotes.',
      'Reflective': 'Focus on introspection, personal growth, and thoughtful analysis of experiences and emotions.',
      'Journalistic': 'Present information clearly and factually while maintaining narrative flow and reader engagement.',
      'Stream of Consciousness': 'Allow thoughts to flow naturally, capturing the raw, unfiltered nature of human thinking.',
      'Letter Format': 'Write as a personal letter, creating intimacy and direct connection with the reader.',
      'Dialogue Heavy': 'Use conversation to drive the story forward, revealing character and plot through speech.',
      'Descriptive': 'Paint vivid pictures with detailed sensory descriptions and rich imagery.',
      'Analytical': 'Present ideas logically with clear structure, supporting evidence, and thoughtful conclusions.',
      'Confessional': 'Write with raw honesty and vulnerability, sharing personal truths and emotional depth.',
      'Satirical': 'Use wit, irony, and humor to comment on human nature or society.',
      'Minimalist': 'Use simple, clear language with maximum impact and minimal words.',
      'Experimental': 'Push creative boundaries with unique structures, perspectives, or narrative techniques.',
      'Academic': 'Write with formal structure, clear arguments, and scholarly tone while maintaining accessibility.',
      'Creative Nonfiction': 'Tell true stories with artistic flair, combining factual accuracy with creative expression.',
      'Fable-like': 'Include moral lessons or allegorical elements while maintaining engaging storytelling.',
      'Diary Entry': 'Write in a personal, daily reflection style with intimate thoughts and feelings.',
      'Travelogue': 'Focus on journey, discovery, and the transformative power of travel experiences.',
      'Memoir Style': 'Share personal life experiences with reflection, growth, and meaningful insights.',
      'Essay Format': 'Present ideas in a structured, argumentative format with clear thesis and supporting points.',
      'Free Verse': 'Use poetic language without strict meter or rhyme, focusing on emotional expression.',
      'Haiku Style': 'Write with brevity and precision, capturing moments with minimal but powerful words.',
      'Prose Poetry': 'Combine poetic language with prose structure, creating lyrical narrative flow.'
    };

    return guides[writingStyle] || 'Write in a clear, engaging style that connects with readers emotionally.';
  }

  // Get tone guide for different emotional tones
  getToneGuide(emotionalTone) {
    const guides = {
      'Vulnerable': 'Express raw emotions, fears, and insecurities with honesty and courage.',
      'Reflective': 'Contemplate experiences, emotions, and life lessons with thoughtful introspection.',
      'Hopeful': 'Convey optimism, possibility, and the belief in positive outcomes and growth.',
      'Joyful': 'Express happiness, celebration, and the beauty of life\'s positive moments.',
      'Nostalgic': 'Evoke memories, longing, and the bittersweet nature of the past.',
      'Grateful': 'Express appreciation, thankfulness, and recognition of life\'s blessings.',
      'Melancholic': 'Convey sadness, longing, and the beauty found in sorrow and reflection.',
      'Empowered': 'Express strength, confidence, and the ability to overcome challenges.',
      'Peaceful': 'Convey calmness, serenity, and inner tranquility.',
      'Passionate': 'Express intense emotions, desires, and fervent beliefs or feelings.',
      'Contemplative': 'Encourage deep thinking, meditation, and philosophical reflection.',
      'Whimsical': 'Create a sense of playfulness, magic, and delightful imagination.',
      'Mysterious': 'Build intrigue, suspense, and the allure of the unknown.',
      'Adventurous': 'Convey excitement, exploration, and the thrill of new experiences.',
      'Romantic': 'Express love, affection, and the beauty of human connection.',
      'Humorous': 'Use wit, comedy, and lightheartedness to entertain and connect.',
      'Serious': 'Address important topics with gravity, respect, and thoughtful consideration.',
      'Inspiring': 'Motivate, uplift, and encourage readers to pursue their dreams and goals.',
      'Curious': 'Express wonder, questioning, and the joy of discovery and learning.',
      'Confident': 'Convey self-assurance, determination, and belief in one\'s abilities.',
      'Gentle': 'Express kindness, tenderness, and compassionate understanding.',
      'Intense': 'Convey powerful emotions, dramatic situations, and heightened experiences.',
      'Dreamy': 'Create an ethereal, imaginative atmosphere with magical or surreal elements.',
      'Playful': 'Use fun, light-hearted language that brings joy and entertainment.'
    };

    return guides[emotionalTone] || 'Maintain an authentic emotional tone that resonates with readers.';
  }
}

module.exports = new FreeAIService(); 