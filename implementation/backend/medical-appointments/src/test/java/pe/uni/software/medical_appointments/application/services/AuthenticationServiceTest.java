package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.uni.software.medical_appointments.application.dtos.auth.request.LoginRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.request.RegisterEmployeeRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.request.RegisterUserPatientRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.request.UpdatePasswordRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.response.AuthResponse;
import pe.uni.software.medical_appointments.application.dtos.auth.response.NewUserResponse;
import pe.uni.software.medical_appointments.domain.entities.Rol;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import org.springframework.security.authentication.BadCredentialsException;
import pe.uni.software.medical_appointments.exception.ConflictException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.RolRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;
import pe.uni.software.medical_appointments.service.JwtService;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthenticationService authenticationService;

    private Usuario buildUsuarioHabilitado(String correo, String passwordHash, String nombreRol) {
        Rol rol = Rol.builder().id(1).nombre(nombreRol).build();
        return Usuario.builder()
                .id(UUID.randomUUID())
                .correo(correo)
                .passwordHash(passwordHash)
                .rol(rol)
                .habilitado(true)
                .intentosFallidos(0)
                .build();
    }

    @Test
    void login_whenCredencialesCorrectas_debeRetornarAuthResponseConToken() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("test@mail.com");
        request.setPassword("password123");

        Usuario usuario = buildUsuarioHabilitado("test@mail.com", "hashCorrecto", "PACIENTE");

        when(usuarioRepository.findByCorreoWithRoles("test@mail.com"))
                .thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "hashCorrecto")).thenReturn(true);
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token-valido");

        AuthResponse response = authenticationService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token-valido", response.getToken());
        verify(usuarioRepository, times(1)).save(usuario);
        assertEquals(0, usuario.getIntentosFallidos());
    }

    @Test
    void login_whenPasswordIncorrecta_debeLanzarBadCredentialsException() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("test@mail.com");
        request.setPassword("wrongPassword");

        Usuario usuario = buildUsuarioHabilitado("test@mail.com", "hashCorrecto", "PACIENTE");
        usuario.setIntentosFallidos(2);

        when(usuarioRepository.findByCorreoWithRoles("test@mail.com"))
                .thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("wrongPassword", "hashCorrecto")).thenReturn(false);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authenticationService.login(request));

        assertEquals("Credenciales incorrectas", exception.getMessage());
        assertEquals(3, usuario.getIntentosFallidos());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void login_whenUsuarioNoExiste_debeLanzarBadCredentialsException() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("noexiste@mail.com");
        request.setPassword("password123");

        when(usuarioRepository.findByCorreoWithRoles("noexiste@mail.com"))
                .thenReturn(Optional.empty());

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authenticationService.login(request));

        assertEquals("Credenciales incorrectas", exception.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registerUserPatient_whenCorreoUnico_debeRegistrarYRetornarNewUserResponse() {
        RegisterUserPatientRequest request = new RegisterUserPatientRequest();
        request.setCorreo("nuevo@mail.com");
        request.setPassword("password123");

        Rol rolPaciente = Rol.builder().id(1).nombre("PACIENTE").build();
        Usuario usuarioGuardado = buildUsuarioHabilitado("nuevo@mail.com", "hashed", "PACIENTE");

        when(usuarioRepository.existsByCorreo("nuevo@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(rolRepository.findByNombre("PACIENTE")).thenReturn(Optional.of(rolPaciente));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);
        when(jwtService.generateToken(usuarioGuardado)).thenReturn("jwt-token");

        NewUserResponse response = authenticationService.registerUserPatient(request);

        assertNotNull(response);
        assertEquals("nuevo@mail.com", response.getCorreo());
        assertTrue(response.getHabilitado());
        assertEquals("jwt-token", response.getToken());
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void registerUserPatient_whenCorreoYaExiste_debeLanzarConflictException() {
        RegisterUserPatientRequest request = new RegisterUserPatientRequest();
        request.setCorreo("existente@mail.com");
        request.setPassword("password123");

        when(usuarioRepository.existsByCorreo("existente@mail.com")).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class,
                () -> authenticationService.registerUserPatient(request));

        assertTrue(exception.getMessage().contains("El correo ya existe"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registerEmployee_whenDatosValidos_debeRegistrarExitosamente() {
        RegisterEmployeeRequest request = new RegisterEmployeeRequest();
        request.setCorreo("empleado@mail.com");
        request.setPassword("password123");
        request.setIdRol(2);

        Rol rolSecretaria = Rol.builder().id(2).nombre("SECRETARIA ADMINISTRATIVA").build();
        Usuario usuarioGuardado = buildUsuarioHabilitado("empleado@mail.com", "hashed", "SECRETARIA ADMINISTRATIVA");

        when(usuarioRepository.existsByCorreo("empleado@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(rolRepository.findById(2)).thenReturn(Optional.of(rolSecretaria));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        authenticationService.registerEmployee(request);

        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioPersistido = usuarioCaptor.getValue();
        assertEquals("empleado@mail.com", usuarioPersistido.getCorreo());
        assertEquals("hashed", usuarioPersistido.getPasswordHash());
        assertEquals(rolSecretaria, usuarioPersistido.getRol());
    }

    @Test
    void registerEmployee_whenCorreoYaExiste_debeLanzarConflictException() {
        RegisterEmployeeRequest request = new RegisterEmployeeRequest();
        request.setCorreo("existente@mail.com");
        request.setPassword("password123");
        request.setIdRol(2);

        when(usuarioRepository.existsByCorreo("existente@mail.com")).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class,
                () -> authenticationService.registerEmployee(request));

        assertTrue(exception.getMessage().contains("El correo ya existe"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void updatePassword_whenDatosCorrectos_debeActualizarExitosamente() {
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setOldPassword("oldPass123");
        request.setNewPassword("newPass123");

        Usuario usuario = buildUsuarioHabilitado("user@mail.com", "hashViejo", "PACIENTE");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@mail.com");
        SecurityContextHolder.setContext(securityContext);
        when(usuarioRepository.findByCorreoWithRoles("user@mail.com"))
                .thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("oldPass123", "hashViejo")).thenReturn(true);
        when(passwordEncoder.encode("newPass123")).thenReturn("hashNuevo");

        authenticationService.updatePassword(request);

        assertEquals("hashNuevo", usuario.getPasswordHash());
        assertNotNull(usuario.getFechaActualizacion());
        verify(usuarioRepository).save(usuario);

        SecurityContextHolder.clearContext();
    }

    @Test
    void updatePassword_whenUsuarioNoEncontrado_debeLanzarNotFoundException() {
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setOldPassword("oldPass123");
        request.setNewPassword("newPass123");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("noexiste@mail.com");
        SecurityContextHolder.setContext(securityContext);
        when(usuarioRepository.findByCorreoWithRoles("noexiste@mail.com"))
                .thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> authenticationService.updatePassword(request));

        assertTrue(exception.getMessage().contains("No se encontró usuario con correo"));

        SecurityContextHolder.clearContext();
    }

    @Test
    void updatePassword_whenOldPasswordIncorrecta_debeLanzarBadCredentialsException() {
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setOldPassword("wrongOldPass");
        request.setNewPassword("newPass123");

        Usuario usuario = buildUsuarioHabilitado("user@mail.com", "hashViejo", "PACIENTE");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@mail.com");
        SecurityContextHolder.setContext(securityContext);
        when(usuarioRepository.findByCorreoWithRoles("user@mail.com"))
                .thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("wrongOldPass", "hashViejo")).thenReturn(false);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authenticationService.updatePassword(request));

        assertTrue(exception.getMessage().contains("La contraseña actual es incorrecta"));
        verify(usuarioRepository, never()).save(any());

        SecurityContextHolder.clearContext();
    }
}
