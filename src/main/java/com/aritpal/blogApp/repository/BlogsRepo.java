package com.aritpal.blogApp.repository;

import com.aritpal.blogApp.model.Blogs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogsRepo extends JpaRepository<Blogs, Long> {

}
