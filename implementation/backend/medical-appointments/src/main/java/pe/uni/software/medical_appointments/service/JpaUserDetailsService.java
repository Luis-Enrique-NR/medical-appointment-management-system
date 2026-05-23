package pe.uni.software.medical_appointments.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.repository.UsuarioRepository;

@Service("userDetailsService")
@Transactional
public class JpaUserDetailsService implements UserDetailsService {

  @Autowired
  private UsuarioRepository usuarioRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

    return usuarioRepository.findByCorreoWithRoles(username)
            .orElseThrow(() -> new UsernameNotFoundException("No se encontró el usuario con correo "+username));
  }
}
