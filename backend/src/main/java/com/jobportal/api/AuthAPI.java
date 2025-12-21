package com.jobportal.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.AccountStatus;
import com.jobportal.dto.UserDTO;
import com.jobportal.exception.JobPortalException;
import com.jobportal.jwt.AuthenticationRequest;
import com.jobportal.jwt.AuthenticationResponse;
import com.jobportal.jwt.JwtHelper;
import com.jobportal.service.UserService;

@RestController
@CrossOrigin
@RequestMapping("/auth")
public class AuthAPI {
	@Autowired
	private UserDetailsService userDetailsService;
	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private JwtHelper jwtHelper;
	
	@Autowired
	private UserService userService;
	
	@PostMapping("/login")
	public ResponseEntity<?>createAuthenticationToken(@RequestBody AuthenticationRequest request) throws JobPortalException{
		// First check if the account is locked before attempting authentication
		try {
			UserDTO user = userService.getUserByEmail(request.getEmail());
			if (user.getAccountStatus() != null && user.getAccountStatus() == AccountStatus.LOCKED) {
				String reason = user.getLockedReason() != null ? user.getLockedReason() : "Policy violation";
				throw new JobPortalException("Your account has been locked. Reason: " + reason);
			}
			if (user.getAccountStatus() != null && user.getAccountStatus() == AccountStatus.SUSPENDED) {
				throw new JobPortalException("Your account has been suspended. Please contact support.");
			}
		} catch (JobPortalException e) {
			if (e.getMessage().contains("locked") || e.getMessage().contains("suspended")) {
				throw e;
			}
			// User not found - let authentication handle it
		}
		
		try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new JobPortalException("Incorrect username or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtHelper.generateToken(userDetails);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
	}
}
