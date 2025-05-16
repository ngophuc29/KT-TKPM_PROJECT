package com.gearvn.entities;

public class Breadcrumb {
    private String name;
    private String link;

    public Breadcrumb() {
    }

    public Breadcrumb(String name, String link) {
        this.name = name;
        this.link = link;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

}
