package pe.uni.software.medical_appointments.util;

import java.util.concurrent.ThreadLocalRandom;

public class CodeGenerator {

  /**
   * Genera un código aleatorio de exactamente 10 caracteres basado en un prefijo.
   * El número de dígitos aleatorios se adapta según la longitud del prefijo.
   */
  public static String generarCodigo(String prefijo) {
    if (prefijo == null || prefijo.length() >= 10) {
      throw new IllegalArgumentException("El prefijo no puede ser nulo ni medir 10 o más caracteres.");
    }

    StringBuilder codigo = new StringBuilder(10);
    codigo.append(prefijo);

    // Calculamos cuántos dígitos faltan para llegar a 10
    int digitosFaltantes = 10 - prefijo.length();

    // Generamos los dígitos aleatorios necesarios
    for (int i = 0; i < digitosFaltantes; i++) {
      int digitoAleatorio = ThreadLocalRandom.current().nextInt(0, 10);
      codigo.append(digitoAleatorio);
    }

    return codigo.toString();
  }
}