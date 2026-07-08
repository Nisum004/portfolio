document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Effect
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Project Dialog Modals handler
  const projectButtons = document.querySelectorAll('.open-project');
  projectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const projectId = button.getAttribute('data-project');
      const dialog = document.getElementById(`modal-${projectId}`);
      if (dialog) {
        dialog.showModal();
      }
    });
  });

  // Close buttons inside dialogs
  const closeDialogButtons = document.querySelectorAll('.close-dialog');
  closeDialogButtons.forEach(button => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      if (dialog) {
        dialog.close();
      }
    });
  });

  // Close dialog on clicking backdrop
  const dialogs = document.querySelectorAll('.project-dialog');
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

  // 3. Fallback for Scroll Reveal Animations
  const supportsScrollTimeline = window.CSS && 
    CSS.supports('animation-timeline', 'view()') && 
    CSS.supports('animation-range', 'entry');

  if (!supportsScrollTimeline) {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = `
      .scroll-reveal {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .scroll-reveal.in-view {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(styleSheet);

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // 4. OpenAI-Inspired Playground Logic
  const pgOutput = document.getElementById('pg-output');
  const pgForm = document.getElementById('pg-form');
  const pgInput = document.getElementById('pg-input');
  
  const sliderTemp = document.getElementById('slider-temp');
  const valTemp = document.getElementById('val-temp');
  const sliderTokens = document.getElementById('slider-tokens');
  const valTokens = document.getElementById('val-tokens');
  const modelSelect = document.getElementById('model-select');

  // Sync range input values with display labels
  sliderTemp.addEventListener('input', () => {
    valTemp.textContent = parseFloat(sliderTemp.value).toFixed(2);
  });

  sliderTokens.addEventListener('input', () => {
    valTokens.textContent = sliderTokens.value;
  });

  // Quick Query Buttons
  const queryButtons = document.querySelectorAll('.pg-query-btn');
  queryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      executePlaygroundQuery(query);
    });
  });

  pgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = pgInput.value.trim();
    if (query) {
      executePlaygroundQuery(query);
      pgInput.value = '';
    }
  });

  // Support Ctrl+Enter / Cmd+Enter inside the textarea to submit
  pgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      pgForm.requestSubmit();
    }
  });

  function executePlaygroundQuery(userInput) {
    const temp = parseFloat(sliderTemp.value);
    const maxTokens = parseInt(sliderTokens.value);
    const model = modelSelect.value;
    
    // 1. Append User Bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerHTML = `
      <span class="msg-author font-mono">User (${model}):</span>
      <p class="msg-text">${escapeHTML(userInput)}</p>
    `;
    pgOutput.appendChild(userMsg);

    // 2. Compute Response based on input matching & Temperature
    const responseText = getPlaygroundResponse(userInput, temp, maxTokens);
    
    // Simulate generation latency (300ms)
    setTimeout(() => {
      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'msg assistant';
      assistantMsg.innerHTML = `
        <span class="msg-author font-mono">Assistant (temp=${temp.toFixed(2)}, tokens=${maxTokens}):</span>
        <div class="msg-text">${responseText}</div>
      `;
      pgOutput.appendChild(assistantMsg);
      pgOutput.scrollTop = pgOutput.scrollHeight;
    }, 300);
  }

  function getPlaygroundResponse(inputStr, temp, maxTokens) {
    const query = inputStr.toLowerCase().trim();
    
    // Define base answers matching CV facts
    let facts = {
      about: "Nisum Yonghang is an LLM, AI, and Machine Learning Specialist currently pursuing a Bachelor of Science in Computer Science & Information Technology (CSIT) at St. Xavier's College, Maitighar (GPA: 3.65). He focuses on agentic AI networks, RAG search pipelines, and PyTorch deep models.",
      projects: "Nisum's major projects include:<br>• <strong>HOT_DEALS</strong>: Multi-Agent AI System utilizing LangChain and RAG to track pricing bargains.<br>• <strong>Vehicle Detection</strong>: Traffic counting framework using YOLOv11 and OpenCV tracking centroids.<br>• <strong>Tea Leaf path classification</strong>: Pathogen CNN in Jhapa with Grad-CAM activation overlays.<br>• <strong>Hand Sign detection</strong>: Real-time gestural tracking mapping skin-morphology vectors.<br>• <strong>Pneumonia scanner</strong>: Radiological CNN diagnosing chest radiographs.",
      skills: "<strong>Languages:</strong> Python, Javascript, C++, Java, C, PHP.<br><strong>AI & LLMs:</strong> Large Language Models, RAG, Multi-Agent Systems, LangChain, LiteLLM, QLoRA/LoRA fine-tuning.<br><strong>Deep Learning:</strong> PyTorch, OpenCV, YOLOv11, CNNs, Centroid Object Tracking, Grad-CAM.<br><strong>Tools:</strong> AWS, Git, GitHub, MySQL, Postman, Label Studio.",
      contact: "Let's collaborate! You can reach Nisum here:<br>• Email: <a href='mailto:izanamitube@gmail.com'>izanamitube@gmail.com</a><br>• Phone: +977-9863692418<br>• LinkedIn: <a href='https://www.linkedin.com/in/nisum-limbu' target='_blank'>linkedin.com/in/nisum-limbu</a><br>• GitHub: <a href='https://github.com/Nisum004' target='_blank'>github.com/Nisum004</a>"
    };

    // Determine target category
    let category = 'default';
    if (containsAny(query, ['about', 'profile', 'nisum', 'who are you', 'bio'])) {
      category = 'about';
    } else if (containsAny(query, ['projects', 'repos', 'code', 'portfolio'])) {
      category = 'projects';
    } else if (containsAny(query, ['skills', 'tools', 'languages', 'python', 'pytorch'])) {
      category = 'skills';
    } else if (containsAny(query, ['contact', 'email', 'phone', 'reach', 'social', 'github', 'linkedin'])) {
      category = 'contact';
    } else if (containsAny(query, ['hot deals', 'hot_deals', 'bargain', 'agent'])) {
      return getProjectSpecificResponse('hot-deals', temp);
    } else if (containsAny(query, ['vehicle', 'car', 'yolo', 'traffic'])) {
      return getProjectSpecificResponse('vehicle-detection', temp);
    } else if (containsAny(query, ['tea', 'leaf', 'disease'])) {
      return getProjectSpecificResponse('tea-leaf', temp);
    } else if (containsAny(query, ['hand', 'sign', 'gesture'])) {
      return getProjectSpecificResponse('hand-sign', temp);
    } else if (containsAny(query, ['pneumonia', 'x-ray', 'chest'])) {
      return getProjectSpecificResponse('pneumonia', temp);
    } else if (containsAny(query, ['gpa', 'grades', 'st. xavier', 'college'])) {
      return adjustTextForTemperature("Nisum studies CSIT at St. Xavier's College with an overall GPA of 3.65. He completed high school science at Little Angel's College with a 3.22 GPA.", temp);
    }

    // Adapt text layout based on temperature slider
    let baseText = facts[category] || `I see you queried "<em>${escapeHTML(inputStr)}</em>". As Nisum's virtual AI portfolio assistant, I can retrieve his projects, skills, education logs, and contact endpoints. Try clicking the quick buttons on the right or ask about a specific project!`;
    
    return adjustTextForTemperature(baseText, temp);
  }

  function getProjectSpecificResponse(projectId, temp) {
    let details = {
      'hot-deals': "<strong>HOT_DEALS — Multi-Agent AI System</strong><br>Tech Stack: Python, LangChain, LiteLLM, RAG, Gradio.<br>• Designed a network of autonomous agents cooperating to scrape, analyze, value-reason, and alert on retail bargain listings.<br>• Integrated RAG vector stores to reference real-time market averages and built a live Gradio dashboard.",
      'vehicle-detection': "<strong>Vehicle Detection and Counting System</strong><br>Tech Stack: Python, YOLOv11, OpenCV, PyTorch, NumPy.<br>• Built a real-time computer vision system checking vehicle boundary intersections.<br>• Tracked lanes and centroid coordinates dynamically to count traffic rates.",
      'tea-leaf': "<strong>Tea Leaf Disease Classification</strong><br>Tech Stack: Python, PyTorch, OpenCV, Grad-CAM, Transfer Learning.<br>• Trained custom ResNet classifiers on real leaves gathered from Sunkoshi Tea Estate in Jhapa.<br>• Visualized classification activations using Grad-CAM mapping to display explainable pathogen points.",
      'hand-sign': "<strong>Hand Sign Detection System</strong><br>Tech Stack: Python, PyTorch, OpenCV, NumPy.<br>• Created CNN systems interpreting skin segmentation and gestural arrays from live video frames.<br>• Mapped geometric coordinates to translate alphabet postures to digital screen scroll outputs.",
      'pneumonia': "<strong>Pneumonia Detection in Chest X-Rays</strong><br>Tech Stack: Python, PyTorch, Scikit-Learn, Grad-CAM.<br>• Trained CNN architectures diagnosing chest radiographs with high recall rate thresholds.<br>• Built Grad-CAM layers to outline pulmonary lesion activations directly for physicians."
    };
    return adjustTextForTemperature(details[projectId], temp);
  }

  function adjustTextForTemperature(text, temp) {
    if (temp <= 0.2) {
      // Formal, precise, dry
      return `<p style="font-family: var(--font-sans); color: var(--text-primary); font-size: 0.9rem;">[System Log: Low-Temperature Factual Mode]<br>${text.replace(/<br>/g, ' ')}</p>`;
    } else if (temp > 0.8) {
      // Highly conversational, casual, fun, "tokenizer" notes
      return `
        <p style="margin-bottom: 8px;">🔥 <strong>High Temperature Creative Mode (${temp.toFixed(2)})</strong>: Generating stylized responses!</p>
        <p>${text}</p>
        <p style="margin-top: 10px; font-size: 0.75rem; color: var(--accent-purple); font-family: var(--font-mono);">
          [Generation Info: Added creative tokens. No hallucinations detected. Nisum's actual CV facts remain 100% accurate.]
        </p>
      `;
    }
    // Normal output
    return `<p>${text}</p>`;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function containsAny(str, keywords) {
    return keywords.some(keyword => str.includes(keyword));
  }
});
