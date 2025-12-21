package com.jobportal.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.jobportal.dto.AccountStatus;
import com.jobportal.dto.AccountType;
import com.jobportal.dto.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
	@Id
	private Long id;
	private String name;
	@Indexed(unique = true)
	private String email;
	private String password;
	private AccountType accountType;
	private Long profileId;
	private AccountStatus accountStatus;
	private LocalDateTime createdAt;
	private LocalDateTime lastLogin;
	private String lockedReason;
	private Long lockedBy;

	public UserDTO toDTO() {
		return new UserDTO(this.id, this.name, this.email, this.password, this.accountType, this.profileId, 
				this.accountStatus, this.createdAt, this.lastLogin, this.lockedReason, this.lockedBy);
	}

}
