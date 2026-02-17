package com.ebook.service;

import com.ebook.model.Section;
import com.ebook.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public Optional<Section> getSectionById(Long id) {
        return sectionRepository.findById(id);
    }

    public List<Section> getSectionsByEbookId(Long ebookId) {
        return sectionRepository.findByEbookIdOrderBySectionOrderAsc(ebookId);
    }

    public Section createSection(Section section) {
        return sectionRepository.save(section);
    }

    public Section updateSection(Long id, Section sectionDetails) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found with id: " + id));

        section.setTitle(sectionDetails.getTitle());
        section.setContent(sectionDetails.getContent());
        section.setSectionOrder(sectionDetails.getSectionOrder());

        return sectionRepository.save(section);
    }

    public void deleteSection(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found with id: " + id));

        sectionRepository.deleteById(id);
    }

    public void deleteSectionsByEbookId(Long ebookId) {
        List<Section> sections = sectionRepository.findByEbookId(ebookId);
        sectionRepository.deleteAll(sections);
    }
}