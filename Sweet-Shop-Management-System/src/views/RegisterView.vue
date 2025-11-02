<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2 class="auth-title">Create Account</h2>
            <p class="auth-subtitle">Join our Sweet Shop Management System</p>

            <form @submit.prevent="handleRegister" class="auth-form">
                <!-- User Type Selection -->
                <div class="form-group">
                    <label class="form-label">Account Type</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" v-model="form.userType" value="normal" name="userType"
                                class="radio-input" />
                            <span class="radio-custom"></span>
                            Normal User
                        </label>
                        <label class="radio-label">
                            <input type="radio" v-model="form.userType" value="admin" name="userType"
                                class="radio-input" />
                            <span class="radio-custom"></span>
                            Shop Owner (Admin)
                        </label>
                    </div>
                    <span v-if="errors.userType" class="error-message">{{ errors.userType }}</span>
                </div>

                <!-- Shop Name (only for admin) -->
                <div v-if="form.userType === 'admin'" class="form-group">
                    <label for="shopName" class="form-label">Shop Name *</label>
                    <input id="shopName" type="text" v-model="form.shopName" placeholder="Enter your shop name"
                        class="form-input" :class="{ 'error': errors.shopName }" />
                    <span v-if="errors.shopName" class="error-message">{{ errors.shopName }}</span>
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label for="email" class="form-label">Email Address *</label>
                    <input id="email" type="email" v-model="form.email" placeholder="Enter your email"
                        class="form-input" :class="{ 'error': errors.email }" />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <!-- Password -->
                <div class="form-group">
                    <label for="password" class="form-label">Password *</label>
                    <div class="password-field">
                        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="form.password"
                            placeholder="Enter your password" class="form-input"
                            :class="{ 'error': errors.password }" />
                        <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                        </button>
                    </div>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <!-- Confirm Password -->
                <div class="form-group">
                    <label for="confirmPassword" class="form-label">Confirm Password *</label>
                    <input id="confirmPassword" type="password" v-model="form.confirmPassword"
                        placeholder="Confirm your password" class="form-input"
                        :class="{ 'error': errors.confirmPassword }" />
                    <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="submit-btn" :disabled="isLoading">
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
            </form>

            <!-- Login Link -->
            <div class="auth-footer">
                <p>Already have an account?
                    <router-link to="/login" class="auth-link">Sign in here</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
    userType: 'normal',
    shopName: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const errors = reactive({
    userType: '',
    shopName: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const showPassword = ref(false)
const isLoading = ref(false)

// Clear shop name when switching to normal user
watch(() => form.userType, (newType) => {
    if (newType === 'normal') {
        form.shopName = ''
        errors.shopName = ''
    }
})

// Clear errors when user types
watch(() => form.email, () => { errors.email = '' })
watch(() => form.password, () => { errors.password = '' })
watch(() => form.confirmPassword, () => { errors.confirmPassword = '' })
watch(() => form.shopName, () => { errors.shopName = '' })

const validateForm = () => {
    let isValid = true

    // Reset errors
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    // Validate user type
    if (!form.userType) {
        errors.userType = 'Please select an account type'
        isValid = false
    }

    // Validate shop name for admin users
    if (form.userType === 'admin' && !form.shopName.trim()) {
        errors.shopName = 'Shop name is required for shop owners'
        isValid = false
    }

    // Validate email
    if (!form.email.trim()) {
        errors.email = 'Email is required'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address'
        isValid = false
    }

    // Validate password
    if (!form.password.trim()) {
        errors.password = 'Password is required'
        isValid = false
    } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long'
        isValid = false
    }

    // Validate confirm password
    if (!form.confirmPassword.trim()) {
        errors.confirmPassword = 'Please confirm your password'
        isValid = false
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        isValid = false
    }

    return isValid
}

const handleRegister = async () => {
    if (!validateForm()) {
        return
    }

    isLoading.value = true

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Create user object
        const userData = {
            email: form.email,
            userType: form.userType,
            role: form.userType === 'admin' ? 'admin' : 'user',
            shopName: form.userType === 'admin' ? form.shopName : null,
            createdAt: new Date().toISOString()
        }

        // In a real app, you would make an API call here
        console.log('Registering user:', userData)

        // Store user data in localStorage (for demo purposes)
        const existingUsers = JSON.parse(localStorage.getItem('sweetShopUsers') || '[]')

        // Check if user already exists
        const userExists = existingUsers.find(user => user.email === form.email)
        if (userExists) {
            errors.email = 'User with this email already exists'
            return
        }

        existingUsers.push(userData)
        localStorage.setItem('sweetShopUsers', JSON.stringify(existingUsers))

        // Success message (you can replace with a toast notification)
        alert('Account created successfully! You can now log in.')

        // Redirect to login page
        router.push('/login')

    } catch (error) {
        console.error('Registration error:', error)
        alert('Registration failed. Please try again.')
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.auth-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 450px;
}

.auth-title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    text-align: center;
    margin-bottom: 8px;
}

.auth-subtitle {
    color: #666;
    text-align: center;
    margin-bottom: 32px;
    font-size: 16px;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-label {
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    font-size: 14px;
}

.form-input {
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: #fff;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
    border-color: #ef4444;
}

.password-field {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    font-size: 18px;
}

.radio-group {
    display: flex;
    gap: 20px;
    margin-top: 8px;
}

.radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #333;
}

.radio-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #e1e5e9;
    border-radius: 50%;
    margin-right: 8px;
    position: relative;
    transition: all 0.3s ease;
}

.radio-input:checked+.radio-custom {
    border-color: #667eea;
    background-color: #667eea;
}

.radio-input:checked+.radio-custom::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: white;
}

.error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 4px;
}

.submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 12px;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.auth-footer {
    text-align: center;
    margin-top: 24px;
    color: #666;
}

.auth-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

.auth-link:hover {
    text-decoration: underline;
}

@media (max-width: 480px) {
    .auth-card {
        padding: 24px;
    }

    .radio-group {
        flex-direction: column;
        gap: 12px;
    }
}
</style>