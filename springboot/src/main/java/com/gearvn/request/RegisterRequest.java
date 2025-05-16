package com.gearvn.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
	
	 @NotBlank(message = "Tên là bắt buộc")
	    private String firstName;

	    @NotBlank(message = "Họ là bắt buộc")
	    private String lastName;

	    @NotBlank(message = "Tên người dùng là bắt buộc")
	    private String username;

	    @NotBlank(message = "Email là bắt buộc")
	    @Email(message = "Email phải hợp lệ")
	    private String email;

	    @NotBlank(message = "Mật khẩu là bắt buộc")
	    @Size(min = 8, message = "Mật khẩu nên có ít nhất 8 ký tự")
	    private String password;
	    
	    
	    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Số điện thoại không hợp lệ")
	    private String phone;
	
      
}
