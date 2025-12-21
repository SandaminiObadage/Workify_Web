package com.jobportal.dto;

import java.time.LocalDateTime;

import com.jobportal.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private Long id;

	@NotBlank(message = "{user.name.absent}")
	private String name;

	@NotBlank(message = "{user.email.absent}")
	@Email(message = "{user.email.invalid}")
	private String email;

	@NotBlank(message = "{user.password.absent}")
	@Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,15}$", message = "{user.password.invalid}")
	private String password;

	private AccountType accountType;
	private Long profileId;
	private AccountStatus accountStatus;
	private LocalDateTime createdAt;
	private LocalDateTime lastLogin;
	private String lockedReason;
	private Long lockedBy;

	public User toEntity() {
		return new User(this.id, this.name, this.email, this.password, this.accountType, this.profileId,
				this.accountStatus, this.createdAt, this.lastLogin, this.lockedReason, this.lockedBy);
	}

}
