document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Debug log to check token
    console.log('Current token:', token);

    if (!token) {
        console.log('No token found in localStorage');
        alert('Please log in to edit your profile');
        return;
    }

    // Fetch existing user data
    try {
        const response = await fetch('/api/users/my-profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Profile fetch response status:', response.status);
        const userData = await response.json();
        console.log('Profile fetch response data:', userData);
        
        if (response.ok) {
            // Pre-fill form fields
            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            const rollNumberInput = document.getElementById('rollNumber');
            const departmentSelect = document.getElementById('department');
            const yearSelect = document.getElementById('year');
            const semesterSelect = document.getElementById('semester');
            const bioInput = document.getElementById('bio');
            const skillsInput = document.getElementById('skills');
            const interestsInput = document.getElementById('interests');
            const portfolioInput = document.getElementById('portfolio');
            const linkedinInput = document.getElementById('linkedin');
            
            if (fullNameInput) fullNameInput.value = userData.fullName || '';
            if (emailInput) emailInput.value = userData.email || '';
            if (rollNumberInput) rollNumberInput.value = userData.rollNumber || '';
            
            if (departmentSelect) {
                for (let i = 0; i < departmentSelect.options.length; i++) {
                    if (departmentSelect.options[i].value === userData.department) {
                        departmentSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            if (yearSelect) {
                for (let i = 0; i < yearSelect.options.length; i++) {
                    if (yearSelect.options[i].value === userData.year) {
                        yearSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            if (semesterSelect) {
                for (let i = 0; i < semesterSelect.options.length; i++) {
                    if (semesterSelect.options[i].value === userData.semester) {
                        semesterSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            if (bioInput) bioInput.value = userData.bio || '';
            if (skillsInput) skillsInput.value = userData.skills?.join(', ') || '';
            if (interestsInput) interestsInput.value = userData.interests?.join(', ') || '';
            if (portfolioInput) portfolioInput.value = userData.portfolio || '';
            if (linkedinInput) linkedinInput.value = userData.socialLinks?.linkedin || '';
            
            // Set profile images
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            const coverPhotoPreview = document.getElementById('coverPhotoPreview');
            
            if (profilePhotoPreview && userData.avatar) {
                profilePhotoPreview.style.backgroundImage = `url('${userData.avatar}')`;
            }
            if (coverPhotoPreview && userData.banner) {
                coverPhotoPreview.style.backgroundImage = `url('${userData.banner}')`;
            }
        } else {
            console.error('Failed to fetch profile:', userData.message);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});

// Handle form submission
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        console.log('Submitting form with token:', token);
        
        if (!token) {
            console.log('No token found during form submission');
            alert('Please log in to update your profile');
            return;
        }
        
        const formData = new FormData();
        
        // Add form fields
        const fullNameInput = document.getElementById('fullName');
        const usernameInput = document.getElementById('username');
        const departmentSelect = document.getElementById('department');
        const yearSelect = document.getElementById('year');
        const semesterSelect = document.getElementById('semester');
        const bioInput = document.getElementById('bio');
        const skillsInput = document.getElementById('skills');
        const interestsInput = document.getElementById('interests');
        const portfolioInput = document.getElementById('portfolio');
        const linkedinInput = document.getElementById('linkedin');
        
        // Add all form fields to formData
        if (fullNameInput) formData.append('fullName', fullNameInput.value);
        if (usernameInput) formData.append('username', usernameInput.value);
        if (departmentSelect) formData.append('department', departmentSelect.value);
        if (yearSelect) formData.append('year', yearSelect.value);
        if (semesterSelect) formData.append('semester', semesterSelect.value);
        if (bioInput) formData.append('bio', bioInput.value);
        if (skillsInput) formData.append('skills', skillsInput.value);
        if (interestsInput) formData.append('interests', interestsInput.value);
        if (portfolioInput) formData.append('portfolio', portfolioInput.value);
        if (linkedinInput) formData.append('linkedin', linkedinInput.value);
        
        // Add files if selected
        const profilePhotoInput = document.getElementById('profilePhotoInput');
        const coverPhotoInput = document.getElementById('coverPhotoInput');
        
        if (profilePhotoInput && profilePhotoInput.files[0]) {
            formData.append('avatar', profilePhotoInput.files[0]);
        }
        
        if (coverPhotoInput && coverPhotoInput.files[0]) {
            formData.append('banner', coverPhotoInput.files[0]);
        }

        try {
            console.log('Sending profile update request...');
            const response = await fetch('/api/users/update-profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('Profile update response status:', response.status);
            const data = await response.json();
            console.log('Profile update response data:', data);
            
            if (response.ok) {
                // Update localStorage with new data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userName', data.user.fullName);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userRollNumber', data.user.rollNumber);
                localStorage.setItem('userDepartment', data.user.department);
                localStorage.setItem('userYear', data.user.year);
                localStorage.setItem('userSemester', data.user.semester);
                if (data.user.avatar) localStorage.setItem('userProfilePhoto', data.user.avatar);
                if (data.user.banner) localStorage.setItem('userBanner', data.user.banner);
                if (typeof data.user.profileCompleted !== 'undefined') localStorage.setItem('profileCompleted', data.user.profileCompleted);
                
                console.log('Profile updated successfully:', data.user);
                alert('Profile updated successfully!');
                window.location.href = '/dashboard';
            } else {
                console.error('Profile update failed:', data.message);
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating your profile');
        }
    });
}

// Handle profile photo upload
const uploadProfilePhotoBtn = document.getElementById('uploadProfilePhotoBtn');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const profilePhotoPreview = document.getElementById('profilePhotoPreview');

if (uploadProfilePhotoBtn && profilePhotoInput) {
    uploadProfilePhotoBtn.addEventListener('click', () => {
        profilePhotoInput.click();
    });
}

if (profilePhotoInput && profilePhotoPreview) {
    profilePhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePhotoPreview.style.backgroundImage = `url('${e.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Handle cover photo upload
const uploadCoverPhotoBtn = document.getElementById('uploadCoverPhotoBtn');
const coverPhotoInput = document.getElementById('coverPhotoInput');
const coverPhotoPreview = document.getElementById('coverPhotoPreview');

if (uploadCoverPhotoBtn && coverPhotoInput) {
    uploadCoverPhotoBtn.addEventListener('click', () => {
        coverPhotoInput.click();
    });
}

if (coverPhotoInput && coverPhotoPreview) {
    coverPhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                coverPhotoPreview.style.backgroundImage = `url('${e.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    });
}
