package com.rolematch.model;

import java.io.Serializable;

/**
 * Web Technology Lab - Model/JavaBean: Skill
 * Represents a technical skill in the role_matcher database.
 */
public class Skill implements Serializable {
    private static final long serialVersionUID = 1L;

    private int skillId;
    private String skillName;

    public Skill() {}

    public Skill(int skillId, String skillName) {
        this.skillId = skillId;
        this.skillName = skillName;
    }

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
}
