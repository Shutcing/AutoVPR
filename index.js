// Функция для преобразования файла в Base64
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Функция для анализа картинки через API
async function analyzeImage(field, base64Image) {
  try {
    const response = await puter.ai.chat(
      "Ёмко и структурно перепиши ифнормацию с картинки",
      base64Image
    );
    return response.message.content;
  } catch (error) {
    console.error(`Ошибка анализа изображения для поля ${field}:`, error);
    return "";
  }
}

// Основной обработчик
document.getElementById("submit").addEventListener("click", async () => {
  const fields = ["text", "term", "answer", "points"];
  const result = {};

  for (const field of fields) {
    const textInput = document.querySelector(`textarea[data-field="${field}"]`);
    const fileInput = document.querySelector(`input[data-field="${field}"]`);

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const base64Image = await convertFileToBase64(file);
      result[field] = await analyzeImage(field, base64Image);
    } else if (textInput.value.trim()) {
      result[field] = textInput.value.trim();
    } else {
      result[field] = "";
    }
  }

  console.log("Сформированный словарь:", result);

  // Отправляем итоговый запрос нейросети
  try {
    puter.ai
      .chat(
        `Проверь ответ на задание по заданным условиям и критериям: ${JSON.stringify(
          result
        )}`
      )
      .then((response) => {
        document.getElementById("output").innerText = response;
      });
  } catch (error) {
    console.error("Ошибка отправки итогового запроса:", error);
    document.getElementById("output").innerText = "Ошибка анализа.";
  }
});
