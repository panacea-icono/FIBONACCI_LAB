import os
import json

def listar_archivos_y_carpetas(ruta):
    """
    Lista todos los archivos y carpetas en la ruta especificada.

    Args:
        ruta (str): Ruta del directorio a analizar.

    Returns:
        dict: Estructura de archivos y carpetas.
    """
    estructura = {}
    for root, dirs, files in os.walk(ruta):
        estructura[root] = {"carpetas": dirs, "archivos": files}
    return estructura

def revisar_dependencias(package_json_path):
    if os.path.exists(package_json_path):
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_json = json.load(f)
        return package_json.get("dependencies", {}), package_json.get("devDependencies", {})
    return {}, {}

def revisar_variables_entorno(env_path):
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            return f.read().splitlines()
    return []

def buscar_archivos_repetidos(ruta):
    archivos = {}
    repetidos = []
    for root, _, files in os.walk(ruta):
        for file in files:
            ruta_completa = os.path.join(root, file)
            if file in archivos:
                repetidos.append((file, archivos[file], ruta_completa))
            else:
                archivos[file] = ruta_completa
    return repetidos

def generar_auditoria(ruta_proyecto):
    auditoria = []
    auditoria.append("AUDITORÍA DEL PROYECTO\n")
    auditoria.append("=" * 50 + "\n")

    # Listar estructura de archivos y carpetas
    auditoria.append("Estructura de archivos y carpetas:\n")
    estructura = listar_archivos_y_carpetas(ruta_proyecto)
    for carpeta, contenido in estructura.items():
        auditoria.append(f"- {carpeta}:\n")
        auditoria.append(f"  Carpetas: {contenido['carpetas']}\n")
        auditoria.append(f"  Archivos: {contenido['archivos']}\n")
    auditoria.append("\n")

    # Revisar dependencias
    auditoria.append("Dependencias:\n")
    deps, dev_deps = revisar_dependencias(os.path.join(ruta_proyecto, "package.json"))
    auditoria.append(f"  Dependencias: {deps}\n")
    auditoria.append(f"  Dependencias de desarrollo: {dev_deps}\n")
    auditoria.append("\n")

    # Revisar variables de entorno
    auditoria.append("Variables de entorno:\n")
    env_vars = revisar_variables_entorno(os.path.join(ruta_proyecto, ".env"))
    auditoria.append(f"  {env_vars}\n")
    auditoria.append("\n")

    # Buscar archivos repetidos
    auditoria.append("Archivos repetidos:\n")
    repetidos = buscar_archivos_repetidos(ruta_proyecto)
    for archivo, ruta1, ruta2 in repetidos:
        auditoria.append(f"  {archivo}: {ruta1} y {ruta2}\n")
    auditoria.append("\n")

    # Diferenciar frontend, backend y base de datos
    auditoria.append("Diferenciación de Frontend, Backend y Base de Datos:\n")
    auditoria.append("  Frontend: carpeta 'client', 'frontend'\n")
    auditoria.append("  Backend: carpeta 'server'\n")
    auditoria.append("  Base de datos: configuración en 'server/storage.ts'\n")
    auditoria.append("\n")

    # Guardar auditoría en archivo
    with open(os.path.join(ruta_proyecto, "auditoria.txt"), "w", encoding='utf-8') as f:
        f.writelines(auditoria)

# Ejecutar auditoría
generar_auditoria("/home/dr-de-la-tv/Documentos/FIBONACCI_LAB")