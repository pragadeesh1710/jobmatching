package com.rolematch.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Web Technology Lab - Model/JavaBean: Role
 * Represents an industry job role with required skills, description, category, and matching statistics.
 */
public class Role implements Serializable {
    private static final long serialVersionUID = 1L;

    private int roleId;
    private String roleName;
    private String description;
    private String category;
    private String minExperience;
    private List<String> requiredSkills;

    // Computed fields for Role Matching Algorithm (AJAX MatchServlet response)
    private double matchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;

    public Role() {
        this.requiredSkills = new ArrayList<>();
        this.matchedSkills = new ArrayList<>();
        this.missingSkills = new ArrayList<>();
    }

    public Role(int roleId, String roleName, String description, String category, String minExperience) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.description = description;
        this.category = category;
        this.minExperience = minExperience;
        this.requiredSkills = new ArrayList<>();
        this.matchedSkills = new ArrayList<>();
        this.missingSkills = new ArrayList<>();
    }

    // Getters and Setters
    public int getRoleId() {
        return roleId;
    }

    public void setRoleId(int roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMinExperience() {
        return minExperience;
    }

    public void setMinExperience(String minExperience) {
        this.minExperience = minExperience;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }
}
