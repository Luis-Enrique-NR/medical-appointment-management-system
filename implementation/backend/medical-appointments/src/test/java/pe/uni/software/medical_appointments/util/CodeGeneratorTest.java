package pe.uni.software.medical_appointments.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class CodeGeneratorTest {

    @Test
    void generarCodigo_conPrefijoValido_devuelveDiezCaracteres() {
        String codigo = CodeGenerator.generarCodigo("CITA");

        assertEquals(10, codigo.length());
        assertTrue(codigo.startsWith("CITA"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"A", "AB", "PAC", "ESPEC", "PREFIJO12"})
    void generarCodigo_conDistintosPrefijos_siempreDiezCaracteres(String prefijo) {
        String codigo = CodeGenerator.generarCodigo(prefijo);

        assertEquals(10, codigo.length());
        assertTrue(codigo.startsWith(prefijo));
    }

    @Test
    void generarCodigo_completaConDigitos() {
        String codigo = CodeGenerator.generarCodigo("CITA");
        String sufijo = codigo.substring("CITA".length());

        assertEquals(6, sufijo.length());
        assertTrue(sufijo.matches("\\d+"), "El sufijo debe ser solo dígitos: " + sufijo);
    }

    @Test
    void generarCodigo_prefijoNulo_lanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -> CodeGenerator.generarCodigo(null));
    }

    @ParameterizedTest
    @ValueSource(strings = {"1234567890", "PREFIJODEMASIADOLARGO"})
    void generarCodigo_prefijoDiezOMasCaracteres_lanzaExcepcion(String prefijo) {
        assertThrows(IllegalArgumentException.class, () -> CodeGenerator.generarCodigo(prefijo));
    }

    @Test
    void generarCodigo_prefijoVacio_generaDiezDigitos() {
        String codigo = CodeGenerator.generarCodigo("");

        assertEquals(10, codigo.length());
        assertTrue(codigo.matches("\\d{10}"));
    }
}
