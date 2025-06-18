document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resultsContainer = document.getElementById('results');
    const loadingContainer = document.getElementById('loading');
    const generatedContent = document.getElementById('generated-content');
    const metadataContainer = document.getElementById('metadata');
    
    // API Configuration - Updated to current Gemini API
    const GEMINI_API_KEY = 'AIzaSyCni1GnJyyqtOMQWsdZnMvpi9p-glGR_0A';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Prompt Templates (unchanged)
    const PROMPT_TEMPLATES = {
        'lesson-plan': `Create a detailed {gradeLevel} lesson plan on {topic} for {learningStyle} learners. 
Include:
1. Learning objectives
2. Required materials
3. Step-by-step activities (30-45 minutes total)
4. Assessment questions
5. Differentiation strategies for different learners
Use {language} and format with clear headings and bullet points.`,
        
        'study-guide': `Create a comprehensive {gradeLevel} study guide on {topic} suitable for {learningStyle} learners.
Include:
1. Key concepts and definitions
2. 3-5 important examples
3. Diagrams or visual aids if helpful
4. 5 practice questions with answers
5. Memory aids or mnemonics
Use {language} and organize clearly.`,
        
        'quiz': `Create a 10-question {gradeLevel} quiz on {topic} in {language}.
Include:
1. 5 multiple-choice questions
2. 3 true/false questions
3. 2 short-answer questions
4. Answer key at the end
Format for {learningStyle} learners with clear instructions.`,
        
        'flashcards': `Create 10 flashcards for {gradeLevel} students studying {topic} in {language}.
Each flashcard should have:
Front: A clear question or term
Back: A concise answer or definition (max 2 sentences)
Format them for {learningStyle} learners with one flashcard per line like this:
Q: Question text
A: Answer text
...`,
        
        'case-study': `Create a real-world case study about {topic} for {gradeLevel} students in {language}.
Include:
1. Background context
2. Key problem or challenge
3. Relevant data/facts
4. 3-5 discussion questions
5. Possible solutions (to be revealed later)
Format for {learningStyle} learners with clear sections.`
    };
    
    // Event Listeners (unchanged)
    generateBtn.addEventListener('click', generateContent);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadContent);
    
    // Main Generation Function (mostly unchanged)
    async function generateContent() {
        // Get form values
        const contentType = document.getElementById('content-type').value;
        const topic = document.getElementById('topic').value.trim();
        const gradeLevel = document.getElementById('grade-level').value;
        const learningStyle = document.querySelector('input[name="learning-style"]:checked').value;
        const language = document.getElementById('language').value;
        
        // Validate input
        if (!topic) {
            alert('Please enter a topic');
            return;
        }
        
        // Show loading state
        loadingContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        
        try {
            // Prepare the prompt
            const prompt = PROMPT_TEMPLATES[contentType]
                .replace('{topic}', topic)
                .replace('{gradeLevel}', getGradeLevelText(gradeLevel))
                .replace('{learningStyle}', learningStyle)
                .replace('{language}', language);
            
            // Call Gemini API
            const startTime = Date.now();
            const response = await callGeminiAPI(prompt);
            const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
            
            // Process response - updated for Gemini
            const content = response.candidates[0].content.parts[0].text;
            const tokensUsed = response.usageMetadata ? 
                response.usageMetadata.totalTokenCount : 'Not available';
            
            // Display results
            generatedContent.textContent = content;
            metadataContainer.innerHTML = `
                <p><strong>Generation Time:</strong> ${generationTime} seconds</p>
                <p><strong>Tokens Used:</strong> ${tokensUsed}</p>
            `;
            
            // Show results
            loadingContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating content. Please try again.\nError: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Content';
        }
    }
    
    // Updated Gemini API call function
    async function callGeminiAPI(prompt) {
        const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1500
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
        }
        
        return response.json();
    }
    
    // Helper function to get grade level text (unchanged)
    function getGradeLevelText(level) {
        const levels = {
            'elementary': 'elementary school',
            'middle': 'middle school',
            'high': 'high school',
            'college': 'college/university'
        };
        return levels[level] || level;
    }
    
    // Copy to clipboard function (unchanged)
    function copyToClipboard() {
        const content = generatedContent.textContent;
        navigator.clipboard.writeText(content)
            .then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy text to clipboard');
            });
    }
    
    // Download content function (unchanged)
    function downloadContent() {
        const content = generatedContent.textContent;
        const topic = document.getElementById('topic').value.trim() || 'educational-content';
        const contentType = document.getElementById('content-type').value;
        const filename = `${contentType}-${topic.replace(/\s+/g, '-')}.txt`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});