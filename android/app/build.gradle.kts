plugins {
    id("com.android.application")
}

android {
    namespace = "es.neira.juegos"
    compileSdk = 34

    defaultConfig {
        applicationId = "es.neira.juegos"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        // Direccion de la web donde estan los juegos (se actualizan solos)
        buildConfigField("String", "JUEGOS_URL", "\"https://neidostore.github.io/juegos-neira/\"")
    }
    buildFeatures { buildConfig = true }
    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
