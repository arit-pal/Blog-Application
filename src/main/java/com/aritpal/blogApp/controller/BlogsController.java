package com.aritpal.blogApp.controller;

import com.aritpal.blogApp.model.Blogs;
import com.aritpal.blogApp.service.BlogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blogs")
public class BlogsController {

    private final BlogService blogService;

    public BlogsController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to my blog";
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Blogs> getAllBlogs() {
        return blogService.getAllBlogs();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Blogs getBlogsById(@PathVariable long id) {
        return blogService.getBlogsById(id);
    }

    @PostMapping("/post")
    @PreAuthorize("hasRole('ADMIN')")
    public boolean postBlogs(@RequestBody Blogs blogs) {
        blogService.postBlogs(blogs);
        return true;
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public boolean updateBlog(@RequestBody Blogs blogs) {
        blogService.updateBlogs(blogs);
        return true;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public boolean deleteBlog(@PathVariable long id) {
        blogService.deleteBlogs(id);
        return true;
    }

}
