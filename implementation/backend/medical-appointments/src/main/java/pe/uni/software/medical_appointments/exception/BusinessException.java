package pe.uni.software.medical_appointments.exception;

import org.springframework.http.HttpStatus;

public abstract class BusinessException extends RuntimeException{
  public BusinessException(String message) {
    super(message);
  }
  public abstract HttpStatus getHttpStatus();
}
