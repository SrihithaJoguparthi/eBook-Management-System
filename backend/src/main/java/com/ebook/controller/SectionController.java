package com.ebook.controller;

import com.ebook.model.Section;
import com.ebook.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sections")
@CrossOrigin(origins = "*")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @GetMapping
    public ResponseEntity<List<Section>> getAllSections() {
        return ResponseEntity.ok(sectionService.getAllSections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSectionById(@PathVariable Long id) {
        return sectionService.getSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ebook/{ebookId}")
    public ResponseEntity<List<Section>> getSectionsByEbookId(@PathVariable Long ebookId) {
        return ResponseEntity.ok(sectionService.getSectionsByEbookId(ebookId));
    }

    @PostMapping
    public ResponseEntity<?> createSection(@RequestBody Section section) {
        try {
            Section savedSection = sectionService.createSection(section);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSection);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create section: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSection(@PathVariable Long id, @RequestBody Section sectionDetails) {
        try {
            Section updatedSection = sectionService.updateSection(id, sectionDetails);
            return ResponseEntity.ok(updatedSection);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSection(@PathVariable Long id) {
        try {
            sectionService.deleteSection(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Section deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/ebook/{ebookId}")
    public ResponseEntity<?> deleteSectionsByEbookId(@PathVariable Long ebookId) {
        try {
            sectionService.deleteSectionsByEbookId(ebookId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All sections deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete sections: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}