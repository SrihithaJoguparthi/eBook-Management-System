package com.ebook.service;

import com.ebook.model.Ebook;
import com.ebook.repository.EbookRepository;
import com.ebook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EbookService {

    @Autowired
    private EbookRepository ebookRepository;

    @Autowired
    private UserRepository userRepository;

    private final String uploadDir = "uploads/ebooks/";

    public EbookService() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public List<Ebook> getAllEbooks() {
        return ebookRepository.findAll();
    }

    public Optional<Ebook> getEbookById(Long id) {
        return ebookRepository.findById(id);
    }

    public List<Ebook> searchEbooks(String keyword) {
        return ebookRepository.searchEbooks(keyword);
    }

    public Ebook createEbook(Ebook ebook, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            ebook.setFilePath(fileName);
        }
        ebook.setUploadDate(LocalDateTime.now());
        return ebookRepository.save(ebook);
    }

    public Ebook updateEbook(Long id, Ebook ebookDetails, MultipartFile file) throws IOException {
        Ebook ebook = ebookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ebook not found with id: " + id));

        ebook.setTitle(ebookDetails.getTitle());
        ebook.setAuthor(ebookDetails.getAuthor());
        ebook.setCategory(ebookDetails.getCategory());
        ebook.setDescription(ebookDetails.getDescription());

        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            ebook.setFilePath(fileName);
        }

        return ebookRepository.save(ebook);
    }

    public void deleteEbook(Long id) {
        Ebook ebook = ebookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ebook not found with id: " + id));

        // Delete file from filesystem
        try {
            if (ebook.getFilePath() != null) {
                Path filePath = Paths.get(uploadDir + ebook.getFilePath());
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Error deleting file: " + e.getMessage());
        }

        ebookRepository.deleteById(id);
    }

    private String saveFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";

        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;

        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public List<Ebook> getEbooksByCategory(String category) {
        return ebookRepository.findByCategory(category);
    }

    public byte[] getEbookFile(Long id) throws IOException {
        Ebook ebook = ebookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ebook not found with id: " + id));

        if (ebook.getFilePath() == null) {
            throw new RuntimeException("No file associated with this ebook");
        }

        Path filePath = Paths.get(uploadDir + ebook.getFilePath());

        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found: " + ebook.getFilePath());
        }

        return Files.readAllBytes(filePath);
    }

    public List<Ebook> getEbooksByUserId(Long userId) {
        return ebookRepository.findByUserId(userId);
    }
}