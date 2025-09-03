# 📱 Guía Completa: App Nativa con Capacitor

## 📋 Resumen

Tu proyecto ya tiene **Capacitor configurado** y listo para generar apps nativas para iOS y Android. Esta guía te llevará paso a paso desde exportar el código hasta tener la app corriendo en tu dispositivo.

## ⚙️ Configuración Actual

### ✅ Ya tienes configurado:
- **Capacitor Core** instalado
- **Configuración base** en `capacitor.config.ts`:
  - App ID: `app.lovable.b13ff51f7e244139a56e1e306f4ea2c4`
  - App Name: `react-royale-74`
  - Hot-reload habilitado para desarrollo

## 🚀 Proceso Completo: De Web a Nativa

### **Paso 1: Exportar tu Proyecto** 📤

1. En Lovable, haz clic en el botón **"Export to GitHub"** (arriba a la derecha)
2. Conecta tu cuenta de GitHub si no lo has hecho
3. Crea un nuevo repositorio o selecciona uno existente
4. Espera a que se complete la exportación

### **Paso 2: Configuración Local** 💻

```bash
# 1. Clona tu repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# 2. Instala las dependencias
npm install

# 3. Agrega las plataformas nativas
npx cap add ios     # Para iOS (requiere Mac)
npx cap add android # Para Android

# 4. Actualiza las dependencias nativas
npx cap update ios     # Si agregaste iOS
npx cap update android # Si agregaste Android

# 5. Construye el proyecto
npm run build

# 6. Sincroniza con las plataformas nativas
npx cap sync
```

### **Paso 3: Desarrollo y Testing** 🔧

#### **Para Android:**
```bash
# Opción 1: Ejecutar en emulador/dispositivo
npx cap run android

# Opción 2: Abrir en Android Studio
npx cap open android
```

#### **Para iOS (Solo en Mac):**
```bash
# Opción 1: Ejecutar en simulador/dispositivo
npx cap run ios

# Opción 2: Abrir en Xcode
npx cap open ios
```

## 🔄 Flujo de Desarrollo Continuo

### **Cada vez que hagas cambios:**

1. **Edita en Lovable** normalmente
2. **Git pull** para traer los cambios:
   ```bash
   git pull origin main
   ```
3. **Sincroniza** los cambios:
   ```bash
   npm run build
   npx cap sync
   ```
4. **Prueba** en tu dispositivo/emulador

## 📲 Requisitos del Sistema

### **Para Android:**
- **Android Studio** instalado
- **Java Development Kit (JDK)** 8 o superior
- **Android SDK** (viene con Android Studio)
- **Dispositivo Android** o **Emulador** configurado

### **Para iOS:**
- **macOS** (requisito obligatorio)
- **Xcode** (desde App Store)
- **iOS Simulator** o **dispositivo iOS físico**
- **Cuenta de desarrollador de Apple** (para dispositivos físicos)

## 🔥 Hot Reload en Desarrollo

Tu app está configurada para **hot-reload** desde Lovable:

1. **Inicia** la app nativa en tu dispositivo
2. **Edita** directamente en Lovable
3. **Los cambios aparecen** automáticamente en la app nativa
4. **No necesitas** rebuild cada vez

> **URL de desarrollo:** `https://b13ff51f-7e24-4139-a56e-1e306f4ea2c4.lovableproject.com?forceHideBadge=true`

## 🚨 Solución de Problemas Comunes

### **Error: "capacitor.config.ts not found"**
```bash
# Asegúrate de estar en el directorio correcto
pwd
ls -la capacitor.config.ts
```

### **Error: "Platform android/ios not found"**
```bash
# Agrega la plataforma nuevamente
npx cap add android  # o ios
```

### **Error de sincronización**
```bash
# Limpia y reconstruye
rm -rf node_modules
npm install
npm run build
npx cap sync
```

### **App no actualiza los cambios**
```bash
# Fuerza la sincronización
npx cap copy
npx cap sync --force
```

## 📝 Comandos de Referencia Rápida

| Acción | Comando |
|--------|---------|
| Agregar plataforma | `npx cap add ios/android` |
| Construir proyecto | `npm run build` |
| Sincronizar cambios | `npx cap sync` |
| Ejecutar en dispositivo | `npx cap run ios/android` |
| Abrir IDE nativo | `npx cap open ios/android` |
| Copiar archivos web | `npx cap copy` |
| Ver logs | `npx cap run android --consolelogs` |

## 🎯 Siguientes Pasos

1. **Desarrollo:** Continúa editando en Lovable
2. **Testing:** Usa `git pull` + `npx cap sync` para probar cambios
3. **Publicación:** Cuando esté listo, sigue las guías de Google Play Store / App Store

## 🔗 Recursos Útiles

- [Documentación oficial de Capacitor](https://capacitorjs.com/docs)
- [Guía de publicación Android](https://capacitorjs.com/docs/android/deploying)
- [Guía de publicación iOS](https://capacitorjs.com/docs/ios/deploying)
- [Blog post de Lovable sobre desarrollo móvil](https://lovable.dev/blogs/TODO)

---

¡Tu app está lista para ser nativa! 🚀📱