// Функция для преобразования файла в Base64 с предварительным сжатием
function convertFileToCompressedBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 1024; // Максимальный размер (ширина или высота)
        let width = img.width;
        let height = img.height;

        // Масштабируем, если размер превышает maxDimension
        if (width > height && width > maxDimension) {
          height = (maxDimension / width) * height;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (maxDimension / height) * width;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Получаем сжатое изображение в формате Base64
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // Качество 80%
        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
      img.src = reader.result; // Загружаем изображение в элемент <img>
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // Читаем файл как Data URL
  });
}

// Функция для анализа картинки через API
async function analyzeImage(field, base64Image) {
  try {
    const response = await puter.ai.chat(
      "Ёмко и структурно перепиши информацию с картинки",
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
      const compressedBase64Image = await convertFileToCompressedBase64(file);
      result[field] = await analyzeImage(field, compressedBase64Image);
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
        `Проверь ответ на задание по заданным условиям и критериям. Мне нужен строгий и ёмкий анализ по пунктам из критериев: ${JSON.stringify(
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
