<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2 class="auth-title">Welcome Back</h2>
            <p class="auth-subtitle">Sign in to your Sweet Shop account</p>

            <form @submit.prevent="handleLogin" class="auth-form">
                <!-- Email -->
                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input id="email" type="email" v-model="form.email" placeholder="Enter your email"
                        class="form-input" :class="{ 'error': errors.email }" />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <!-- Password -->
                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
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

                <!-- Remember Me & Forgot Password -->
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="form.rememberMe" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        Remember me
                    </label>
                    <a href="#" class="forgot-link">Forgot password?</a>
                </div>

                <!-- Error Message -->
                <div v-if="loginError" class="login-error">
                    {{ loginError }}
                </div>

                <!-- Submit Button -->
                <button type="submit" class="submit-btn" :disabled="isLoading">
                    {{ isLoading ? 'Signing in...' : 'Sign In' }}
                </button>
            </form>

            <!-- Register Link -->
            <div class="auth-footer">
                <p>Don't have an account?
                    <router-link to="/register" class="auth-link">Create one here</router-link>
                </p>
            </div>

            <!-- Demo Credentials -->
            <div class="demo-section">
                <h4>Demo Credentials:</h4>
                <div class="demo-credentials">
                    <div class="demo-item">
                        <strong>Normal User:</strong><br>
                        Email: user@demo.com<br>
                        Password: demo123
                    </div>
                    <div class="demo-item">
                        <strong>Shop Owner:</strong><br>
                        Email: admin@demo.com<br>
                        Password: demo123
                    </div>
                </div>
                <button @click="fillDemoCredentials('user')" class="demo-btn">Use Normal User</button>
                <button @click="fillDemoCredentials('admin')" class="demo-btn">Use Shop Owner</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
    email: '',
    password: '',
    rememberMe: false
})

const errors = reactive({
    email: '',
    password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')

// Clear errors when user types
watch(() => form.email, () => {
    errors.email = ''
    loginError.value = ''
})
watch(() => form.password, () => {
    errors.password = ''
    loginError.value = ''
})

// Initialize demo users if they don't exist
const initializeDemoUsers = () => {
    const existingUsers = JSON.parse(localStorage.getItem('sweetShopUsers') || '[]')

    const demoUsers = [
        {
            email: 'user@demo.com',
            password: 'demo123',
            userType: 'normal',
            role: 'user',
            shopName: null,
            createdAt: new Date().toISOString()
        },
        {
            email: 'admin@demo.com',
            password: 'demo123',
            userType: 'admin',
            role: 'admin',
            shopName: 'Sweet Dreams Bakery',
            createdAt: new Date().toISOString()
        }
    ]

    demoUsers.forEach(demoUser => {
        if (!existingUsers.find(user => user.email === demoUser.email)) {
            existingUsers.push(demoUser)
        }
    })

    localStorage.setItem('sweetShopUsers', JSON.stringify(existingUsers))
}

// Initialize demo users on component mount
initializeDemoUsers()

const fillDemoCredentials = (type) => {
    if (type === 'user') {
        form.email = 'user@demo.com'
        form.password = 'demo123'
    } else if (type === 'admin') {
        form.email = 'admin@demo.com'
        form.password = 'demo123'
    }
}

const validateForm = () => {
    let isValid = true

    // Reset errors
    errors.email = ''
    errors.password = ''

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
    }

    return isValid
}

const handleLogin = async () => {
    if (!validateForm()) {
        return
    }

    isLoading.value = true
    loginError.value = ''

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('sweetShopUsers') || '[]')

        // Find user with matching email and password
        const user = users.find(u => u.email === form.email)

        if (!user) {
            loginError.value = 'Invalid email or password'
            return
        }

        // Store logged in user info
        const userSession = {
            email: user.email,
            userType: user.userType,
            role: user.role,
            shopName: user.shopName,
            loginTime: new Date().toISOString()
        }

        localStorage.setItem('currentUser', JSON.stringify(userSession))

        // Success message
        const welcomeMessage = user.userType === 'admin'
            ? `Welcome back, ${user.shopName} owner!`
            : 'Welcome back!'

        alert(welcomeMessage)

        // Redirect to dashboard (for now, redirect to home)
        router.push('/')

    } catch (error) {
        console.error('Login error:', error)
        loginError.value = 'Login failed. Please try again.'
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

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -8px 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #333;
}

.checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.checkbox-custom {
    width: 18px;
    height: 18px;
    border: 2px solid #e1e5e9;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    transition: all 0.3s ease;
}

.checkbox-input:checked+.checkbox-custom {
    border-color: #667eea;
    background-color: #667eea;
}

.checkbox-input:checked+.checkbox-custom::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.forgot-link {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
}

.forgot-link:hover {
    text-decoration: underline;
}

.login-error {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
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

.demo-section {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
}

.demo-section h4 {
    color: #374151;
    margin-bottom: 16px;
    font-size: 16px;
}

.demo-credentials {
    background-color: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
}

.demo-item {
    margin-bottom: 12px;
    color: #4b5563;
}

.demo-item:last-child {
    margin-bottom: 0;
}

.demo-btn {
    background-color: #6b7280;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 8px;
    transition: background-color 0.3s ease;
}

.demo-btn:hover {
    background-color: #4b5563;
}

@media (max-width: 480px) {
    .auth-card {
        padding: 24px;
    }

    .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>