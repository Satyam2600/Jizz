document.addEventListener("DOMContentLoaded", async () => {
    const confessionForm = document.getElementById("confessionForm");
    const confessionsContainer = document.getElementById("confessionsFeed");
    const confessionText = document.getElementById("confessionText");

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Load initial confessions
    loadConfessions();

    // Handle confession submission
    if (confessionForm) {
        confessionForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            if (!confessionText.value.trim()) {
                alert("Please write something to confess!");
                return;
            }

            try {
                const content = confessionText.value;
                await apiRequest("/confessions", "POST", { content }, token);
                confessionText.value = "";
                loadConfessions(); // Reload confessions after posting
            } catch (error) {
                console.error("Error posting confession:", error);
                alert("Failed to post confession. Please try again.");
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
        const emojiPickerBtn = document.getElementById("emojiPickerBtn");
        const emojiPickerContainer = document.getElementById(
          "emoji-picker-container"
        );
        const emojiPicker = emojiPickerContainer.querySelector("emoji-picker");

        console.log("Emoji picker elements:", {
          emojiPickerBtn,
          emojiPickerContainer,
          emojiPicker,
        }); // Debug log

        if (emojiPickerBtn && emojiPickerContainer && emojiPicker) {
          // Handle emoji selection
          emojiPicker.addEventListener("emoji-click", (event) => {
            console.log("Emoji clicked:", event.detail); // Debug log
            const confessionText = document.getElementById("confessionText");
            if (confessionText) {
              const cursorPosition = confessionText.selectionStart;
              const textBeforeCursor = confessionText.value.substring(
                0,
                cursorPosition
              );
              const textAfterCursor =
                confessionText.value.substring(cursorPosition);
              const emoji = event.detail.unicode;
              confessionText.value = textBeforeCursor + emoji + textAfterCursor;
              const newCursorPosition = cursorPosition + emoji.length;
              confessionText.focus();
              confessionText.setSelectionRange(
                newCursorPosition,
                newCursorPosition
              );
            }
            emojiPickerContainer.style.display = "none";
          });

          // Handle emoji button click
          emojiPickerBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Emoji button clicked"); // Debug log
            toggleEmojiPicker();
          });

          // Handle clicking outside of emoji picker
          document.addEventListener("click", (e) => {
            if (
              emojiPickerContainer.style.display === "block" &&
              !emojiPickerContainer.contains(e.target) &&
              !emojiPickerBtn.contains(e.target)
            ) {
              emojiPickerContainer.style.display = "none";
            }
          });
        }
      });

      // Toggle emoji picker visibility
      function toggleEmojiPicker() {
        const emojiPickerContainer = document.getElementById(
          "emoji-picker-container"
        );
        const emojiPickerBtn = document.getElementById("emojiPickerBtn");

        if (!emojiPickerContainer || !emojiPickerBtn) {
          console.error("Emoji picker elements not found"); // Debug log
          return;
        }

        const isVisible = emojiPickerContainer.style.display === "block";
        console.log("Toggling emoji picker, current visibility:", isVisible); // Debug log

        if (isVisible) {
          emojiPickerContainer.style.display = "none";
        } else {
          const buttonRect = emojiPickerBtn.getBoundingClientRect();
          console.log("Button position:", buttonRect); // Debug log

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate position to ensure the picker is always visible
          let leftPosition = Math.min(
            buttonRect.left,
            viewportWidth - 320 - 10
          );
          leftPosition = Math.max(10, leftPosition);

          let topPosition = buttonRect.bottom + 10;
          if (topPosition + 350 > viewportHeight) {
            topPosition = Math.max(10, buttonRect.top - 350 - 10);
          }

          console.log("Calculated position:", { leftPosition, topPosition }); // Debug log

          emojiPickerContainer.style.top = `${topPosition}px`;
          emojiPickerContainer.style.left = `${leftPosition}px`;
          emojiPickerContainer.style.display = "block";
        }
      }

      // Theme handling
      document.addEventListener("DOMContentLoaded", function () {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          document.body.setAttribute("data-bs-theme", savedTheme);
        }

        // Theme toggle functionality
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
          themeToggle.addEventListener("click", function () {
            const body = document.body;
            const isDark = body.getAttribute("data-bs-theme") === "dark";
            const newTheme = isDark ? "light" : "dark";
            body.setAttribute("data-bs-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            this.innerHTML = isDark
              ? '<i class="bi bi-sun"></i>'
              : '<i class="bi bi-moon"></i>';
          });
        }

        // Initialize tooltips
        var tooltipTriggerList = [].slice.call(
          document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Character counter
        const confessionText = document.getElementById("confessionText");
        const charCounter =
          confessionText.nextElementSibling.querySelector("small");

        confessionText.addEventListener("input", function () {
          const charCount = this.value.length;
          charCounter.textContent = `${charCount}/500`;
        });

        // Initialize image upload
        const imageInput = document.getElementById("imageUpload");
        if (imageInput) {
          imageInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Check file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
              alert("Image size should be less than 100MB");
              return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
              const previewContainer = document.createElement("div");
              previewContainer.className = "media-preview-container";
              previewContainer.innerHTML = `
              <div class="position-relative">
                <img src="${e.target.result}" class="img-fluid rounded" alt="Preview">
                <button type="button" class="remove-media-btn" onclick="removeImagePreview()">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            `;

              const existingPreview = document.querySelector(
                ".media-preview-container"
              );
              if (existingPreview) {
                existingPreview.remove();
              }

              const confessionText = document.getElementById("confessionText");
              if (confessionText && confessionText.parentElement) {
                confessionText.parentElement.insertBefore(
                  previewContainer,
                  confessionText.nextSibling
                );
                window.currentImageFile = file;
              }
            };
            reader.readAsDataURL(file);
          });
        }
      });

      // Logout functionality
      function logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Remove image preview
      window.removeImagePreview = function () {
        const previewContainer = document.querySelector(
          ".media-preview-container"
        );
        if (previewContainer) {
          previewContainer.remove();
        }
        window.currentImageFile = null;
        const imageInput = document.getElementById("imageUpload");
        if (imageInput) {
          imageInput.value = "";
        }
      };

      // Form submission
      document
        .getElementById("confessionForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();
          const confessionText = document.getElementById("confessionText");
          const charCounter =
            confessionText.nextElementSibling.querySelector("small");

          try {
            let imageUrl = null;
            if (window.currentImageFile) {
              const formData = new FormData();
              formData.append("media", window.currentImageFile);

              const uploadResponse = await fetch("/api/uploads/post-media", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
              });

              if (!uploadResponse.ok) {
                throw new Error("Failed to upload image");
              }

              const uploadData = await uploadResponse.json();
              imageUrl = uploadData.filePath;
            }

            const response = await fetch("/api/confessions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                content: confessionText.value,
                image: imageUrl,
              }),
            });

            if (response.ok) {
              confessionText.value = "";
              if (charCounter) {
                charCounter.textContent = "0/500";
              }
              if (window.currentImageFile) {
                removeImagePreview();
              }
              await loadConfessions();
            } else {
              const error = await response.json();
              alert(
                error.message || "Failed to post confession. Please try again."
              );
            }
          } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
          }
        });

      // Load confessions from the server
      async function loadConfessions() {
        try {
          const token = localStorage.getItem("token");
          const response = await apiRequest("/confessions", "GET", null, token);
          const feed = document.getElementById("confessionsFeed");
          feed.innerHTML = "";

          if (!response || response.length === 0) {
            feed.innerHTML = `
                <div class="empty-state">
                    <img src="/assets/images/empty-confessions.svg" alt="No confessions yet">
                    <h3>No Confessions Yet</h3>
                    <p>Be the first to share your thoughts anonymously! Your secret is safe with us. 🤫</p>
                </div>
            `;
            return;
          }

          response.forEach(confession => {
            const confessionElement = document.createElement("div");
            confessionElement.className = "confession-card mb-4";
            
            // Safely escape content
            const tempDiv = document.createElement("div");
            tempDiv.textContent = confession.content;
            const escapedContent = tempDiv.innerHTML;

            confessionElement.innerHTML = `
                <div class="confession-header">
                    <div class="d-flex gap-3 align-items-center">
                        <div class="confession-avatar">
                            <i class="bi bi-person"></i>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge-anonymous">
                                <i class="bi bi-incognito me-2"></i>
                                Anonymous
                            </span>
                            <small class="text-muted">${new Date(confession.createdAt).toLocaleString()}</small>
                        </div>
                    </div>
                </div>
                <div class="confession-content">
                    <p class="mb-3">${escapedContent}</p>
                    ${confession.image ? `<img src="${confession.image}" class="img-fluid rounded mb-3" alt="Confession image">` : ''}
                </div>
                <div class="confession-meta">
                    <div class="d-flex gap-3">
                        <button class="btn action-button like-button" onclick="handleLike('${confession._id}')">
                            <i class="bi bi-heart${confession.likes > 0 ? '-fill text-danger' : ''} me-2"></i>
                            <span>${confession.likes || 0}</span>
                        </button>
                        <button class="btn action-button comment-button" onclick="toggleComments('${confession._id}')">
                            <i class="bi bi-chat me-2"></i>
                            <span>${confession.comments ? confession.comments.length : 0}</span>
                        </button>
                    </div>
                    <div id="comments-${confession._id}" class="mt-3" style="display: none;">                        <div class="comments-list">
                            ${confession.comments && confession.comments.length > 0 ? confession.comments.map(comment => {
                                const tempCommentDiv = document.createElement("div");
                                tempCommentDiv.textContent = comment.content;
                                return `
                                    <div class="comment-item">
                                        <div class="confession-avatar">
                                            <i class="bi bi-person"></i>
                                        </div>
                                        <div class="comment-content">
                                            <p class="mb-0">${tempCommentDiv.innerHTML}</p>
                                            <small class="text-muted">
                                                ${new Date(comment.createdAt).toLocaleString()}
                                                · Anonymous
                                            </small>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p class="text-muted text-center my-3">No comments yet. Be the first to comment!</p>'}
                        </div>
                        <form class="mt-2" onsubmit="handleComment(event, '${confession._id}')">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Add a comment..." required>
                                <button class="btn btn-success" type="submit">Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            feed.appendChild(confessionElement);
          });
        } catch (error) {
          console.error("Error loading confessions:", error);
          document.getElementById("confessionsFeed").innerHTML = `
            <div class="alert alert-danger" role="alert">
                Failed to load confessions. Please refresh the page to try again.
            </div>
        `;
        }
      }

      // Handle confession likes
      async function handleLike(confessionId) {
        try {
          const token = localStorage.getItem("token");
          await apiRequest(`/confessions/${confessionId}/like`, "POST", null, token);
          await loadConfessions(); // Reload to show updated likes
        } catch (error) {
          console.error("Error liking confession:", error);
          alert("Failed to like confession. Please try again.");
        }
      }

      // Toggle comments section
      function toggleComments(confessionId) {
        const commentsSection = document.getElementById(`comments-${confessionId}`);
        if (commentsSection) {
          const isHidden = commentsSection.style.display === "none";
          commentsSection.style.display = isHidden ? "block" : "none";
        }
      }

      // Handle comment submission      async function handleComment(event, confessionId) {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('input');
        const content = input.value.trim();

        if (!content) return;

        try {
          const token = localStorage.getItem("token");
          const response = await apiRequest(`/confessions/${confessionId}/comments`, "POST", { content }, token);
          
          if (response) {
            input.value = ""; // Clear input
            await loadConfessions(); // Reload to show new comment
          } else {
            throw new Error("Failed to add comment");
          }
        } catch (error) {
          console.error("Error posting comment:", error);
          alert(error.message || "Failed to post comment. Please try again.");
        }
      

      // Initial load
      loadConfessions();

      // Set up auto-refresh every 30 seconds
      setInterval(loadConfessions, 30000);