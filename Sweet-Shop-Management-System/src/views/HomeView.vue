<template>
    <div class="home-container">
        <nav class="navbar">
            <div class="nav-content">
                <h1 class="nav-title">🍭 Sweet Shop Management</h1>
                <div class="nav-actions">
                    <div v-if="currentUser" class="user-info">
                        <span class="user-welcome">
                            Welcome, {{ currentUser.userType === 'admin' ? currentUser.shopName : 'User' }}!
                        </span>
                        <span class="user-role" :class="currentUser.userType">
                            {{ currentUser.userType === 'admin' ? 'Shop Owner' : 'Customer' }}
                        </span>
                        <button @click="logout" class="logout-btn">Logout</button>
                    </div>
                    <div v-else class="auth-buttons">
                        <router-link to="/login" class="nav-btn login-btn">Login</router-link>
                        <router-link to="/register" class="nav-btn register-btn">Register</router-link>
                    </div>
                </div>
            </div>
        </nav>

        <main class="main-content">
            <div class="hero-section">
                <h2 class="hero-title">Sweet Shop Management System</h2>
                <p class="hero-subtitle">
                    Manage your sweet shop business efficiently with our comprehensive management solution
                </p>

                <div v-if="!currentUser" class="cta-section">
                    <p class="cta-text">Get started by creating an account or browse our sweet collection</p>
                    <div class="cta-buttons">
                        <router-link to="/register" class="cta-btn primary">Create Account</router-link>
                        <router-link to="/login" class="cta-btn secondary">Sign In</router-link>
                    </div>
                </div>

                <div v-else class="dashboard-section">
                    <h3 class="dashboard-title">Your Dashboard</h3>
                    <div class="features-grid">
                        <div class="feature-card" v-for="feature in getFeatures()" :key="feature.title">
                            <div class="feature-icon">{{ feature.icon }}</div>
                            <h4 class="feature-title">{{ feature.title }}</h4>
                            <p class="feature-description">{{ feature.description }}</p>
                            <button class="feature-btn" @click="featureComingSoon(feature.title)">
                                {{ feature.action }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            <p>&copy; 2025 Sweet Shop Management System. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)

onMounted(() => {
    // Check if user is logged in
    const userSession = localStorage.getItem('currentUser')
    if (userSession) {
        currentUser.value = JSON.parse(userSession)
    }
})

const logout = () => {
    localStorage.removeItem('currentUser')
    currentUser.value = null
    alert('Logged out successfully!')
    router.push('/')
}

const getFeatures = () => {
    if (!currentUser.value) return []

    const commonFeatures = [
        {
            icon: '🛒',
            title: 'Browse Products',
            description: 'Explore our wide range of sweet products',
            action: 'Browse Now'
        },
        {
            icon: '📱',
            title: 'Order History',
            description: 'View your past orders and track current ones',
            action: 'View Orders'
        }
    ]

    const adminFeatures = [
        {
            icon: '🍬',
            title: 'Product Management',
            description: 'Add, edit, and manage your sweet products inventory',
            action: 'Manage Products'
        },
        {
            icon: '⚙️',
            title: 'Shop Settings',
            description: 'Configure your shop settings and preferences',
            action: 'Settings'
        }
    ]

    return currentUser.value.userType === 'admin'
        ? [...adminFeatures, ...commonFeatures]
        : commonFeatures
}

const featureComingSoon = (featureName) => {
    if (featureName === 'Browse Products') {
        router.push('/sweets')
    } else if (featureName === 'Product Management') {
        router.push('/admin/sweets')
    } else {
        alert(`${featureName} feature is coming soon! This is a demo of the authentication system.`)
    }
}
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navbar {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 16px 0;
}

.nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-welcome {
    font-weight: 600;
    color: #333;
}

.user-role {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.user-role.admin {
    background-color: #fee2e2;
    color: #dc2626;
}

.user-role.normal {
    background-color: #dbeafe;
    color: #2563eb;
}

.logout-btn {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.logout-btn:hover {
    background-color: #dc2626;
}

.auth-buttons {
    display: flex;
    gap: 12px;
}

.nav-btn {
    padding: 10px 20px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.login-btn {
    background-color: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}

.login-btn:hover {
    background-color: #667eea;
    color: white;
}

.register-btn {
    background-color: #667eea;
    color: white;
}

.register-btn:hover {
    background-color: #5a67d8;
}

.main-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    width: 100%;
}

.hero-section {
    text-align: center;
    margin-bottom: 60px;
}

.hero-title {
    font-size: 48px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
}

.hero-subtitle {
    font-size: 20px;
    color: #666;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.cta-section {
    margin-top: 40px;
}

.cta-text {
    font-size: 18px;
    color: #555;
    margin-bottom: 24px;
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
}

.cta-btn {
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
}

.cta-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.cta-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.cta-btn.secondary {
    background-color: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}

.cta-btn.secondary:hover {
    background-color: #667eea;
    color: white;
}

.cta-btn.browse {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    border: none;
}

.cta-btn.browse:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.dashboard-section {
    margin-top: 40px;
}

.dashboard-title {
    font-size: 32px;
    font-weight: 600;
    color: #333;
    margin-bottom: 32px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-top: 32px;
}

.feature-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-align: center;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.feature-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
}

.feature-description {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
}

.feature-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.feature-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 20px;
    margin-top: 40px;
}

@media (max-width: 768px) {
    .nav-content {
        flex-direction: column;
        gap: 16px;
    }

    .hero-title {
        font-size: 36px;
    }

    .hero-subtitle {
        font-size: 18px;
    }

    .cta-buttons {
        flex-direction: column;
        align-items: center;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }
}
</style>