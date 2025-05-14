package com.aritpal.blogApp.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "blogs")
@EntityListeners(AuditingEntityListener.class)
public class Blogs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long blogId;
    @Column(name = "author", nullable = false, length = 255)
    private String blogAuthor;
    @Column(name = "title", nullable = false, length = 255)
    private String blogTitle;
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String blogContent;
    @CreatedDate
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

}
