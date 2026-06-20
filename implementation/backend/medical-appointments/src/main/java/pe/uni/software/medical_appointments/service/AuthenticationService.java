package pe.uni.software.medical_appointments.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.dto.mapper.UsuarioMapper;
import pe.uni.software.medical_appointments.dto.request.LoginRequest;
import pe.uni.software.medical_appointments.dto.request.RegisterEmployeeRequest;
import pe.uni.software.medical_appointments.dto.request.RegisterUserPatientRequest;
import pe.uni.software.medical_appointments.dto.request.UpdatePasswordRequest;
import pe.uni.software.medical_appointments.dto.response.AuthResponse;
import pe.uni.software.medical_appointments.dto.response.NewUserResponse;
import pe.uni.software.medical_appointments.entity.Rol;
import pe.uni.software.medical_appointments.entity.Usuario;
import pe.uni.software.medical_appointments.exception.ConflictException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.repository.RolRepository;
import pe.uni.software.medical_appointments.repository.UsuarioRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

  private final UsuarioRepository usuarioRepository;
  private final RolRepository rolRepository;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public AuthResponse login(LoginRequest request) {
    Usuario user = usuarioRepository.findByCorreoWithRoles(request.getCorreo())
            .orElseThrow(() -> new BadCredentialsException("Credenciales incorrectas"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      user.setIntentosFallidos(user.getIntentosFallidos() + 1);
      usuarioRepository.save(user);
      throw new BadCredentialsException("Credenciales incorrectas");
    }

    // Si la contraseña es correcta: reiniciamos intentos y actualizamos último acceso
    user.setIntentosFallidos(0);
    user.setUltimoAcceso(LocalDateTime.now());
    usuarioRepository.save(user);

    var jwtToken = jwtService.generateToken(user);
    return AuthResponse.builder().token(jwtToken).build();
  }

  @Transactional
  public NewUserResponse registerUserPatient(RegisterUserPatientRequest request) {
    // Verificar que el usuario no existe
    if (usuarioRepository.existsByCorreo(request.getCorreo())) throw new ConflictException("El correo ya existe");

    // Hashear la contraseña
    String hashPsw = passwordEncoder.encode(request.getPassword());

    // Asignar un rol
    Rol rol = rolRepository.findByNombre("PACIENTE")
            .orElseThrow(() -> new NotFoundException("Rol no encontrado"));

    // Guardar al Usuario
    var user = usuarioRepository.save(UsuarioMapper.buildUsuario(request.getCorreo(), hashPsw, rol));

    var jwtToken = jwtService.generateToken(user);

    return UsuarioMapper.mapNewUsuario(user, jwtToken);
  }

  // TODO: REGISTRAR PACIENTE (DATOS PERSONALES, NO COMO USUARIO)

  @Transactional
  public void registerEmployee(RegisterEmployeeRequest request) {
    // Verificar que el usuario no existe
    if (usuarioRepository.existsByCorreo(request.getCorreo())) throw new ConflictException("El correo ya existe");

    // Hashear la contraseña
    String hashPsw = passwordEncoder.encode(request.getPassword());

    // Asignar un rol
    Rol rol = rolRepository.findById(request.getIdRol())
            .orElseThrow(() -> new NotFoundException("Rol no encontrado"));

    // Guardar al Usuario
    var user = usuarioRepository.save(UsuarioMapper.buildUsuario(request.getCorreo(), hashPsw, rol));
  }

  @Transactional
  public void updatePassword(UpdatePasswordRequest request) {
    // 1. Obtener el Principal actual de forma segura
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String correo = auth.getName();

    // Verificar que el usuario exista
    Usuario usuario = usuarioRepository.findByCorreoWithRoles(correo)
            .orElseThrow(() -> new NotFoundException("No se encontró usuario con correo: "+correo));

    // 2. Validar contraseña actual
    if (!passwordEncoder.matches(request.getOldPassword(), usuario.getPassword())) {
      throw new BadCredentialsException("La contraseña actual es incorrecta");
    }

    // 3. Actualizar contraseña
    usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    usuario.setFechaActualizacion(LocalDateTime.now());

    usuarioRepository.save(usuario);
  }
}
