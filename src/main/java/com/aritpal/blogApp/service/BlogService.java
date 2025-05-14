package com.aritpal.blogApp.service;

import com.aritpal.blogApp.model.Blogs;
import com.aritpal.blogApp.repository.BlogsRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BlogService {

    private final BlogsRepo blogsRepo;

    public BlogService(BlogsRepo blogsRepo) {
        this.blogsRepo = blogsRepo;
    }

    @Transactional(readOnly = true)
    public List<Blogs> getAllBlogs() {
        return blogsRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Blogs getBlogsById(long id) {
        return blogsRepo.findById(id).orElseThrow();
    }

    @Transactional
    public void postBlogs(Blogs blogs) {
        blogsRepo.save(blogs);
    }

    @Transactional
    public void updateBlogs(Blogs blogs) {
        blogsRepo.save(blogs);
    }

    @Transactional
    public void deleteBlogs(long id) {
        blogsRepo.deleteById(id);
    }

}
