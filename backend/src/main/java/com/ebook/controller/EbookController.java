package com.ebook.controller;

import com.ebook.model.Ebook;
import com.ebook.model.User;
import com.ebook.service.EbookService;
import com.ebook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ebooks")
@CrossOrigin(origins = "*")
public class EbookController {

    @Autowired
    private EbookService ebookService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Ebook>> getAllEbooks() {
        return ResponseEntity.ok(ebookService.getAllEbooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEbookById(@PathVariable Long id) {
        return ebookService.getEbookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Ebook>> searchEbooks(@RequestParam String keyword) {
        return ResponseEntity.ok(ebookService.searchEbooks(keyword));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Ebook>> getEbooksByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ebookService.getEbooksByCategory(category));
    }

    @PostMapping
    public ResponseEntity<?> createEbook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.findByUsername(username);

            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Validate PDF file if provided
            if (file != null && !file.isEmpty()) {
                if (!file.getContentType().equals("application/pdf")) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Only PDF files are allowed");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }

            Ebook ebook = new Ebook();
            ebook.setTitle(title);
            ebook.setAuthor(author);
            ebook.setCategory(category);
            ebook.setDescription(description);
            ebook.setUser(user);

            Ebook savedEbook = ebookService.createEbook(ebook, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEbook);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create ebook: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEbook(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // Validate PDF file if provided
            if (file != null && !file.isEmpty()) {
                if (!file.getContentType().equals("application/pdf")) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Only PDF files are allowed");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }

            Ebook ebookDetails = new Ebook();
            ebookDetails.setTitle(title);
            ebookDetails.setAuthor(author);
            ebookDetails.setCategory(category);
            ebookDetails.setDescription(description);

            Ebook updatedEbook = ebookService.updateEbook(id, ebookDetails, file);
            return ResponseEntity.ok(updatedEbook);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update ebook: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEbook(@PathVariable Long id) {
        try {
            ebookService.deleteEbook(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Ebook deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadEbook(@PathVariable Long id) {
        try {
            byte[] fileContent = ebookService.getEbookFile(id);
            Ebook ebook = ebookService.getEbookById(id)
                    .orElseThrow(() -> new RuntimeException("Ebook not found"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", ebook.getTitle() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to download ebook: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ebook>> getEbooksByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ebookService.getEbooksByUserId(userId));
    }

    @GetMapping("/my-ebooks")
    public ResponseEntity<?> getMyEbooks() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.findByUsername(username);

            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            List<Ebook> ebooks = ebookService.getEbooksByUserId(user.getId());
            return ResponseEntity.ok(ebooks);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch ebooks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}