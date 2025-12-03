<!-- This is the final Paisa Personality Quiz HTML shared via canvas -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Paisa Personality Quiz - Paisabada</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <style>
    body { font-family: 'Inter', sans-serif; background: #f4f8f7; margin: 0; padding: 0; }
    .quiz-container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .question { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
    .options { display: flex; flex-direction: column; gap: 10px; }
    .option { background: #e8f5e9; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
    .option:hover { background: #c8e6c9; }
    .form-container input { display: block; width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; }
    .submit-btn { background: #28a745; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; }
    .submit-btn:hover { background: #218838; }
    .result-popup { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); text-align: center; }
  </style>
</head>
<body>
  <div class="quiz-container" id="quiz">
    <div id="question-step"></div>
  </div>

  <script>
    const questions = [
      { q: "How do you usually decide your monthly savings?", a: ["I save what's left.", "I plan and allocate in advance.", "Depends on the month."] },
      { q: "What's your first reaction when you get a bonus?", a: ["Shopping spree!", "Invest it smartly.", "Treat myself a bit, save the rest."] },
      { q: "What does 'budget' mean to you?", a: ["Too restrictive.", "My best friend.", "Something I try to follow."] },
      { q: "Your biggest money goal is:", a: ["Live comfortably now.", "Build long-term wealth.", "Balance today and tomorrow."] }
    ];
    let currentQ = 0, answers = [], result = "";

    function renderQuestion() {
      const container = document.getElementById('question-step');
      if (currentQ >= questions.length) { renderForm(); return; }
      const q = questions[currentQ];
      container.innerHTML = `<div class='question'>${q.q}</div><div class='options'>${q.a.map((opt, idx) => `<div class='option' onclick='selectAnswer(${idx})'>${opt}</div>`).join('')}</div>`;
    }

    function selectAnswer(index) { answers.push(index); currentQ++; renderQuestion(); }

    function renderForm() {
      const container = document.getElementById('quiz');
      container.innerHTML = `<div class='form-container'>
        <h2>Almost Done! Tell us about you:</h2>
        <input type='text' id='name' placeholder='Name' required />
        <input type='text' id='mobile' placeholder='Mobile Number' required />
        <input type='email' id='email' placeholder='Email Address' required />
        <input type='text' id='city' placeholder='City' required />
        <input type='text' id='occupation' placeholder='Occupation' required />
        <button class='submit-btn' onclick='submitForm()'>Get My Paisa Personality</button>
      </div>`;
    }

    function submitForm() {
      const name = document.getElementById('name').value, email = document.getElementById('email').value;
      const mobile = document.getElementById('mobile').value, city = document.getElementById('city').value;
      const occupation = document.getElementById('occupation').value;
      if (!name || !mobile || !email || !city || !occupation) { alert("Please fill all required fields."); return; }

      const personalityTypes = ["Risky Rockstar", "Investor Panda", "Budget Boss"];
      result = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];

      generatePDF(name, email);
    }

    async function generatePDF(name, email) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Your Paisa Personality Report", 20, 20);
      doc.setFontSize(14);
      doc.text(`Name: ${name}`, 20, 40);
      doc.text(`Personality: ${result}`, 20, 50);
      doc.text(`Insights:`, 20, 65);
      doc.text("This personality reflects your unique approach to money!", 20, 75);

      const fileName = `paisa_personality_${name.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      showResult(name);
    }

    function showResult(name) {
      const container = document.getElementById('quiz');
      container.innerHTML = `<div class='result-popup'>
        <h2>You are a <span style='color:#28a745;'>${result}</span>!</h2>
        <p>Your personalized report has been sent to your email.<br>Thank you, ${name}!</p>
        <button onclick='shareOnWhatsApp()' class='submit-btn' style='background:#25D366;'>Share on WhatsApp</button>
      </div>`;
    }

    function shareOnWhatsApp() {
      const msg = encodeURIComponent("I just discovered I'm a Paisa Personality – what's yours? Take the quiz now at paisabada.in/personality.html!");
      window.open("https://wa.me/?text=" + msg, "_blank");
    }

    renderQuestion();
  </script>
</body>
</html>
