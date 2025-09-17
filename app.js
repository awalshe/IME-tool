// IME Priority Referral Form - Simple and Robust Implementation
(function() {
    'use strict';

    // Application State
    let appState = {
        currentStep: 0,
        answers: {},
        path: [],
        startTime: new Date()
    };

    // DOM Elements
    let elements = {};

    // Steps configuration
    const steps = [
        'startScreen',
        'cancellationScreen', 
        'imeReasonScreen',
        'claimDeterminationScreen',
        'priorityScreen',
        'simpleEndScreen',
        'summaryScreen'
    ];

    // Initialize the application
    function init() {
        // Cache DOM elements
        cacheElements();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show initial screen
        showScreen('startScreen');
        updateProgress();
        
        console.log('IME Form initialized successfully');
    }

    function cacheElements() {
        // Form elements
        elements.claimNumber = document.getElementById('claimNumber');
        elements.reasonSelection = document.getElementById('reasonSelection');
        elements.appointmentDate = document.getElementById('appointmentDate');
        elements.cancellationReason = document.getElementById('cancellationReason');
        elements.additionalInfo = document.getElementById('additionalInfo');
        elements.imeReason = document.getElementById('imeReason');
        elements.injuryType = document.getElementById('injuryType');
        elements.determinationQuestion = document.getElementById('determinationQuestion');
        elements.otherQuestion = document.getElementById('otherQuestion');
        elements.urgencyReason = document.getElementById('urgencyReason');
        
        // Buttons
        elements.startNext = document.getElementById('startNext');
        elements.cancellationBack = document.getElementById('cancellationBack');
        elements.cancellationSubmit = document.getElementById('cancellationSubmit');
        elements.imeReasonBack = document.getElementById('imeReasonBack');
        elements.imeReasonNext = document.getElementById('imeReasonNext');
        elements.claimDeterminationBack = document.getElementById('claimDeterminationBack');
        elements.claimDeterminationNext = document.getElementById('claimDeterminationNext');
        elements.priorityBack = document.getElementById('priorityBack');
        elements.prioritySubmit = document.getElementById('prioritySubmit');
        elements.simpleEndBack = document.getElementById('simpleEndBack');
        elements.simpleEndComplete = document.getElementById('simpleEndComplete');
        elements.copyToClipboard = document.getElementById('copyToClipboard');
        elements.printToPDF = document.getElementById('printToPDF');
        elements.startOver = document.getElementById('startOver');
        
        // Other elements
        elements.progressFill = document.getElementById('progressFill');
        elements.progressText = document.getElementById('progressText');
        elements.summaryContent = document.getElementById('summaryContent');
        elements.otherQuestionGroup = document.getElementById('otherQuestionGroup');
        elements.urgencyReasonGroup = document.getElementById('urgencyReasonGroup');
    }

    function setupEventListeners() {
        // Start screen
        if (elements.startNext) {
            elements.startNext.addEventListener('click', handleStartNext);
        }

        // Cancellation flow
        if (elements.cancellationBack) {
            elements.cancellationBack.addEventListener('click', () => goToScreen('startScreen'));
        }
        if (elements.cancellationSubmit) {
            elements.cancellationSubmit.addEventListener('click', handleCancellationSubmit);
        }

        // IME Reason flow
        if (elements.imeReasonBack) {
            elements.imeReasonBack.addEventListener('click', () => goToScreen('startScreen'));
        }
        if (elements.imeReasonNext) {
            elements.imeReasonNext.addEventListener('click', handleIMEReasonNext);
        }

        // Claim Determination flow
        if (elements.determinationQuestion) {
            elements.determinationQuestion.addEventListener('change', handleDeterminationQuestionChange);
        }
        if (elements.claimDeterminationBack) {
            elements.claimDeterminationBack.addEventListener('click', () => goToScreen('imeReasonScreen'));
        }
        if (elements.claimDeterminationNext) {
            elements.claimDeterminationNext.addEventListener('click', handleClaimDeterminationNext);
        }

        // Priority flow
        const urgentRadios = document.querySelectorAll('input[name="isUrgent"]');
        urgentRadios.forEach(radio => {
            radio.addEventListener('change', handleUrgentChange);
        });
        if (elements.priorityBack) {
            elements.priorityBack.addEventListener('click', handlePriorityBack);
        }
        if (elements.prioritySubmit) {
            elements.prioritySubmit.addEventListener('click', handlePrioritySubmit);
        }

        // Simple end flow
        if (elements.simpleEndBack) {
            elements.simpleEndBack.addEventListener('click', () => goToScreen('startScreen'));
        }
        if (elements.simpleEndComplete) {
            elements.simpleEndComplete.addEventListener('click', handleSimpleEndComplete);
        }

        // Summary actions
        if (elements.copyToClipboard) {
            elements.copyToClipboard.addEventListener('click', handleCopyToClipboard);
        }
        if (elements.printToPDF) {
            elements.printToPDF.addEventListener('click', () => window.print());
        }
        if (elements.startOver) {
            elements.startOver.addEventListener('click', () => window.location.reload());
        }
    }

    // Event Handlers
    function handleStartNext() {
        if (!validateStartForm()) return;

        const claimNumber = elements.claimNumber.value.trim();
        const reasonValue = elements.reasonSelection.value;
        const reasonText = elements.reasonSelection.options[elements.reasonSelection.selectedIndex].text;

        // Store answers
        appState.answers['Claim Number'] = claimNumber;
        appState.answers['Reason for Request'] = reasonText;
        appState.path.push(`Started with: ${reasonText}`);

        // Route based on selection
        if (reasonValue === 'ime_cancellation') {
            goToScreen('cancellationScreen');
        } else if (reasonValue === 'ime_booking') {
            goToScreen('imeReasonScreen');
        } else {
            goToScreen('simpleEndScreen');
        }
    }

    function handleCancellationSubmit() {
        if (!validateCancellationForm()) return;

        // Collect answers
        appState.answers['Appointment Date'] = elements.appointmentDate.value;
        appState.answers['Cancellation Reason'] = elements.cancellationReason.options[elements.cancellationReason.selectedIndex].text;
        
        const rescheduleRadio = document.querySelector('input[name="rescheduleNeeded"]:checked');
        appState.answers['Reschedule Needed'] = rescheduleRadio ? rescheduleRadio.value : 'Not answered';
        appState.answers['Additional Information'] = elements.additionalInfo.value.trim();

        appState.path.push('Completed cancellation form');
        
        generateAndShowSummary();
    }

    function handleIMEReasonNext() {
        if (!elements.imeReason.value) {
            alert('Please select an IME reason.');
            return;
        }

        const reasonValue = elements.imeReason.value;
        const reasonText = elements.imeReason.options[elements.imeReason.selectedIndex].text;

        appState.answers['IME Reason'] = reasonText;
        appState.path.push(`Selected IME reason: ${reasonText}`);

        if (reasonValue === 'claim_determination') {
            goToScreen('claimDeterminationScreen');
        } else {
            goToScreen('priorityScreen');
        }
    }

    function handleDeterminationQuestionChange() {
        if (elements.determinationQuestion.value === 'other') {
            elements.otherQuestionGroup.style.display = 'block';
        } else {
            elements.otherQuestionGroup.style.display = 'none';
        }
    }

    function handleClaimDeterminationNext() {
        if (!validateClaimDeterminationForm()) return;

        appState.answers['Injury Type'] = elements.injuryType.options[elements.injuryType.selectedIndex].text;
        
        if (elements.determinationQuestion.value === 'other') {
            appState.answers['Determination Question'] = elements.otherQuestion.value.trim();
        } else {
            appState.answers['Determination Question'] = elements.determinationQuestion.options[elements.determinationQuestion.selectedIndex].text;
        }

        appState.path.push('Completed claim determination questions');
        goToScreen('priorityScreen');
    }

    function handleUrgentChange(event) {
        if (event.target.value === 'yes') {
            elements.urgencyReasonGroup.style.display = 'block';
        } else {
            elements.urgencyReasonGroup.style.display = 'none';
        }
    }

    function handlePriorityBack() {
        if (appState.answers['IME Reason'] && appState.answers['IME Reason'].includes('Claim determination')) {
            goToScreen('claimDeterminationScreen');
        } else {
            goToScreen('imeReasonScreen');
        }
    }

    function handlePrioritySubmit() {
        const urgentRadio = document.querySelector('input[name="isUrgent"]:checked');
        if (!urgentRadio) {
            alert('Please indicate if this matter is urgent.');
            return;
        }

        appState.answers['Is Urgent'] = urgentRadio.value;
        if (urgentRadio.value === 'yes') {
            appState.answers['Urgency Reason'] = elements.urgencyReason.value.trim();
        }

        // Determine outcome based on urgency
        let outcome;
        if (urgentRadio.value === 'yes') {
            outcome = 'Submit IME Booking for Priority 1 (Urgent)';
        } else {
            outcome = 'Submit IME Booking for Priority 3 (Standard)';
        }

        appState.answers['Final Outcome'] = outcome;
        appState.path.push(`Completed priority assessment: ${outcome}`);

        generateAndShowSummary();
    }

    function handleSimpleEndComplete() {
        appState.answers['Final Outcome'] = 'Request forwarded to appropriate team';
        appState.path.push('Completed simple request');
        generateAndShowSummary();
    }

    function handleCopyToClipboard() {
        const textArea = document.createElement('textarea');
        textArea.value = elements.summaryContent.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Summary copied to clipboard!');
    }

    // Validation Functions
    function validateStartForm() {
        let isValid = true;
        
        if (!elements.claimNumber.value.trim()) {
            alert('Please enter a claim number.');
            elements.claimNumber.focus();
            isValid = false;
        } else if (!elements.reasonSelection.value) {
            alert('Please select a reason for your request.');
            elements.reasonSelection.focus();
            isValid = false;
        }
        
        return isValid;
    }

    function validateCancellationForm() {
        if (!elements.appointmentDate.value) {
            alert('Please select the appointment date.');
            elements.appointmentDate.focus();
            return false;
        }
        if (!elements.cancellationReason.value) {
            alert('Please select a cancellation reason.');
            elements.cancellationReason.focus();
            return false;
        }
        if (!document.querySelector('input[name="rescheduleNeeded"]:checked')) {
            alert('Please indicate if rescheduling is needed.');
            return false;
        }
        return true;
    }

    function validateClaimDeterminationForm() {
        if (!elements.injuryType.value) {
            alert('Please select the injury type.');
            elements.injuryType.focus();
            return false;
        }
        if (!elements.determinationQuestion.value) {
            alert('Please select the determination question.');
            elements.determinationQuestion.focus();
            return false;
        }
        if (elements.determinationQuestion.value === 'other' && !elements.otherQuestion.value.trim()) {
            alert('Please specify the other question.');
            elements.otherQuestion.focus();
            return false;
        }
        return true;
    }

    // Screen Management
    function showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.form-section');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Update current step
        appState.currentStep = steps.indexOf(screenId);
        updateProgress();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToScreen(screenId) {
        showScreen(screenId);
    }

    function updateProgress() {
        const progress = ((appState.currentStep + 1) / steps.length) * 100;
        if (elements.progressFill) {
            elements.progressFill.style.width = `${progress}%`;
        }
        if (elements.progressText) {
            elements.progressText.textContent = `Step ${appState.currentStep + 1} of ${steps.length}`;
        }
    }

    // Summary Generation
    function generateAndShowSummary() {
        const endTime = new Date();
        const duration = Math.round((endTime - appState.startTime) / 1000);

        let summary = `IME Priority Referral Form Summary\n`;
        summary += `=====================================\n\n`;
        summary += `Completed: ${endTime.toLocaleString()}\n`;
        summary += `Duration: ${duration} seconds\n\n`;

        summary += `RESPONSES:\n`;
        summary += `----------\n`;
        for (const [question, answer] of Object.entries(appState.answers)) {
            if (answer && answer.toString().trim()) {
                summary += `${question}: ${answer}\n`;
            }
        }

        summary += `\nPROCESS FLOW:\n`;
        summary += `-------------\n`;
        summary += appState.path.join('\n↓\n');

        if (elements.summaryContent) {
            elements.summaryContent.textContent = summary;
        }

        goToScreen('summaryScreen');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
