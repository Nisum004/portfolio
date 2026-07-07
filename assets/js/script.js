document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Effect
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  // 2. Bento Card Interactive Mouse Tracker (Glow Effect)
  const bentoCards = document.querySelectorAll('.bento-card');
  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
  // 3. Project Dialog Modals handler
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
  // Close dialog on clicking outside the wrapper (backdrop click)
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
  // 4. Fallback for Scroll Reveal Animations (e.g. Firefox)
  const supportsScrollTimeline = window.CSS && 
    CSS.supports('animation-timeline', 'view()') && 
    CSS.supports('animation-range', 'entry');
  if (!supportsScrollTimeline) {
    // Add CSS fallback dynamically for browsers without scroll-timeline
    const styleSheet = document.createElement('style');
    styleSheet.innerText = `
      .scroll-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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
          revealObserver.unobserve(entry.target); // Reveal only once
        }
      });
    }, {
      threshold: 0.15
    });
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      revealObserver.observe(el);
    });
  }
  // 5. Interactive Console Simulator (Mock CV RAG Agent)
  const terminalBody = document.getElementById('terminal-body');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  
  // Quick-select command buttons
  const cmdButtons = document.querySelectorAll('.cmd-btn');
  cmdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      executeTerminalCommand(cmd);
    });
  });
  terminalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = terminalInput.value.trim();
    if (query) {
      executeTerminalCommand(query);
      terminalInput.value = '';
    }
  });
  function executeTerminalCommand(inputStr) {
    // Print input
    const userLine = document.createElement('p');
    userLine.className = 'terminal-prompt-line';
    userLine.innerHTML = `<span class="prompt-user">nisum@ai-agent</span>:<span class="prompt-dir">~</span>$ <span class="cmd-run">${escapeHTML(inputStr)}</span>`;
    terminalBody.appendChild(userLine);
    // Generate output
    const responseContainer = document.createElement('div');
    responseContainer.className = 'terminal-response';
    
    const command = inputStr.toLowerCase().trim();
    let responseHTML = '';
    if (command === 'help') {
      responseHTML = `
        <p>You can query Nisum's profile using the following standard commands or by asking questions:</p>
        <div class="help-options-grid">
          <button class="cmd-btn" data-cmd="about">about</button>
          <button class="cmd-btn" data-cmd="projects">projects</button>
          <button class="cmd-btn" data-cmd="skills">skills</button>
          <button class="cmd-btn" data-cmd="contact">contact</button>
          <button class="cmd-btn" data-cmd="clear">clear</button>
        </div>
        <p style="margin-top: 12px; color: var(--text-muted);">Or try custom questions like: "Tell me about HOT_DEALS", "What is your GPA?", "Do you know PyTorch?"</p>
      `;
    } else if (command === 'about') {
      responseHTML = `
        <p><strong>Nisum Yonghang</strong> — LLM, AI, and Machine Learning Engineer.</p>
        <p>Currently pursuing a Bachelor of Science in Computer Science & Information Technology (CSIT) at St. Xavier's College, Maitighar (GPA: 3.65).</p>
        <p>Nisum specializes in natural language processing (NLP), designing autonomous multi-agent networks, implementing Retrieval-Augmented Generation (RAG), and training computer vision detectors.</p>
      `;
    } else if (command === 'projects') {
      responseHTML = `
        <p>Nisum has developed several production-grade systems. Type the project name to get details:</p>
        <ul>
          <li><strong>hot-deals</strong>: Multi-Agent AI pricing system (Python, LangChain, RAG)</li>
          <li><strong>vehicle-detection</strong>: Intersection tracking (YOLOv11, OpenCV)</li>
          <li><strong>tea-leaf</strong>: Pathogen classifier in Jhapa (PyTorch, Grad-CAM)</li>
          <li><strong>hand-sign</strong>: Real-time gestural model (PyTorch, OpenCV)</li>
          <li><strong>pneumonia</strong>: Medical diagnostics (PyTorch, X-rays)</li>
        </ul>
        <p style="margin-top: 8px; color: var(--text-muted);">Example: Ask "tell me about hot deals" or click "View Case Study" above.</p>
      `;
    } else if (command === 'skills') {
      responseHTML = `
        <p><strong>Programming Languages:</strong> Python, Javascript, C++, Java, C, PHP</p>
        <p><strong>AI & NLP:</strong> Large Language Models (LLMs), RAG, Multi-Agent Systems, LangChain, LiteLLM, QLoRA/LoRA fine-tuning</p>
        <p><strong>Machine Learning:</strong> Deep Learning, PyTorch, Computer Vision, OpenCV, YOLOv11, CNNs, Object Tracking</p>
        <p><strong>Infrastructure:</strong> AWS (Amazon Web Services), Git, GitHub, MySQL, Postman, Label Studio</p>
      `;
    } else if (command === 'contact') {
      responseHTML = `
        <p>Let's build something together! You can reach Nisum via:</p>
        <p>— <strong>Email:</strong> <a href="mailto:izanamitube@gmail.com" style="color: #fff;">izanamitube@gmail.com</a></p>
        <p>— <strong>Phone:</strong> +977-9863692418</p>
        <p>— <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/nisum-limbu" target="_blank" style="color: #fff;">linkedin.com/in/nisum-limbu</a></p>
        <p>— <strong>GitHub:</strong> <a href="https://github.com/Nisum004" target="_blank" style="color: #fff;">github.com/Nisum004</a></p>
      `;
    } else if (command === 'clear') {
      terminalBody.innerHTML = '';
      // Reset welcome text
      const welcome = document.createElement('p');
      welcome.className = 'terminal-welcome-text';
      welcome.innerText = "Nisum's AI Assistant Profile Console v1.0.0. Console cleared. Type 'help' to see options.";
      terminalBody.appendChild(welcome);
      return;
    } else if (containsAny(command, ['hot_deals', 'hot deals', 'bargain', 'agent', 'deals'])) {
      responseHTML = `
        <p><strong>HOT_DEALS — Multi-Agent AI System</strong></p>
        <p>Tech Stack: Python, LangChain, LiteLLM, RAG, Multi-Agent Architecture, Gradio</p>
        <p>• Engineered a network of specialized AI agents cooperating for information extraction, pricing trends analysis, and value validation.</p>
        <p>• Utilized RAG to feed active market catalogs into decision pipelines, triggering automated bargain alerts.</p>
      `;
    } else if (containsAny(command, ['vehicle', 'car', 'yolo', 'traffic', 'counting'])) {
      responseHTML = `
        <p><strong>Vehicle Detection and Counting System</strong></p>
        <p>Tech Stack: Python, YOLOv11, OpenCV, PyTorch, NumPy</p>
        <p>• Built a high-frequency tracking pipeline detecting vehicles crossing intersecting lines.</p>
        <p>• Managed centroid tracking vectors to trace lane flows and log metrics in real time.</p>
      `;
    } else if (containsAny(command, ['tea', 'leaf', 'disease', 'crop', 'jhapa'])) {
      responseHTML = `
        <p><strong>Tea Leaf Disease Classification</strong></p>
        <p>Tech Stack: Python, PyTorch, torchvision, OpenCV, matplotlib, Transfer Learning</p>
        <p>• Gathered and segmented crop images directly from Sunkoshi Tea Estate (Jhapa) to build pathological models.</p>
        <p>• Mapped convolutional activations utilizing Grad-CAM to present explainable heatmaps to growers.</p>
      `;
    } else if (containsAny(command, ['hand', 'sign', 'gesture', 'translation'])) {
      responseHTML = `
        <p><strong>Hand Sign Detection System</strong></p>
        <p>Tech Stack: Python, PyTorch, OpenCV, NumPy</p>
        <p>• Engineered a CNN classifying hand geometries from webcam video in real time.</p>
        <p>• Integrated morphology filters and dynamic gesture vectors mapping coordinates directly to web scrolls.</p>
      `;
    } else if (containsAny(command, ['pneumonia', 'x-ray', 'medical', 'chest'])) {
      responseHTML = `
        <p><strong>Pneumonia Detection using Chest X-Ray Images</strong></p>
        <p>Tech Stack: Python, PyTorch, Scikit-Learn, Matplotlib, Grad-CAM</p>
        <p>• Developed deep neural classification models scanning chest radiographs to screen pulmonary pathologies.</p>
        <p>• Integrated Grad-CAM visualization to output diagnostic overlays outlining lesion areas.</p>
      `;
    } else if (containsAny(command, ['gpa', 'grades', 'score', 'percentage'])) {
      responseHTML = `
        <p>Nisum maintains excellent academic results:</p>
        <p>• <strong>B.Sc. CSIT</strong> (St. Xavier's College): <strong>3.65 GPA</strong></p>
        <p>• <strong>Science Diploma</strong> (Little Angel's College): <strong>3.22 GPA</strong></p>
      `;
    } else if (containsAny(command, ['education', 'college', 'school', 'study', 'university'])) {
      responseHTML = `
        <p>• <strong>Bachelors in CSIT</strong> (2022 - Present) | St. Xavier’s College, Maitighar, Kathmandu</p>
        <p>• <strong>Academic Diploma in Science</strong> (2019 - 2021) | Little Angel's College, Lalitpur</p>
      `;
    } else if (containsAny(command, ['pytorch', 'tensorflow', 'machine learning', 'deep learning', 'ml', 'ai'])) {
      responseHTML = `
        <p>Nisum has a robust ML toolkit:</p>
        <p>• Deep model training using <strong>PyTorch</strong> and torchvision.</p>
        <p>• CV architectures (YOLOv11, custom CNNs, morphology segmentation, object tracking).</p>
        <p>• LLM applications (LangChain, LiteLLM, agent logic, fine-tuning using QLoRA).</p>
      `;
    } else {
      // Default conversational response simulating a smart AI agent
      responseHTML = `
        <p>Command not recognized. However, since I'm a simulated LLM assistant for Nisum:</p>
        <p>I see you are interested in "<em>${escapeHTML(inputStr)}</em>". Nisum specializes in building production-ready AI pipelines, full-stack systems, and training neural networks.</p>
        <p>Try typing <strong>about</strong>, <strong>projects</strong>, or <strong>contact</strong> to get specific data, or click one of the quick buttons below.</p>
      `;
    }
    responseContainer.innerHTML = responseHTML;
    terminalBody.appendChild(responseContainer);
    
    // Add event listeners to any newly created command buttons inside responses
    const newCmdButtons = responseContainer.querySelectorAll('.cmd-btn');
    newCmdButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        executeTerminalCommand(cmd);
      });
    });
    // Auto-scroll terminal body
    terminalBody.scrollTop = terminalBody.scrollHeight;
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