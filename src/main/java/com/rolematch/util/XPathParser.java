package com.rolematch.util;

import com.rolematch.model.Role;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Web Technology Lab Concept: XML + XPath
 * Demonstrates:
 * 1. DOM Parser: Parsing roles.xml into a W3C Document.
 * 2. XPath Engine: Evaluating XPath expressions (XPathFactory, XPath, XPathExpression).
 * 3. XPathConstants.NODESET: Extracting matching nodes.
 */
public class XPathParser {

    /**
     * Executes an XPath query on the roles.xml file and returns a list of Role objects.
     * Example queries:
     *   - All roles in category: //role[category='Backend']
     *   - Roles requiring a skill: //role[skills/skill='Java']
     *   - All roles: //role
     *
     * @param xmlInputStream InputStream for roles.xml (from ServletContext)
     * @param xpathQuery XPath expression to evaluate
     * @return List of matching Role models
     */
    public static List<Role> queryRoles(InputStream xmlInputStream, String xpathQuery) {
        List<Role> matchedRoles = new ArrayList<>();

        try {
            // STEP 1: Initialize DocumentBuilderFactory and DocumentBuilder
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();

            // STEP 2: Parse XML InputStream into DOM Document
            Document doc = builder.parse(xmlInputStream);

            // STEP 3: Create XPathFactory and XPath object
            XPathFactory xPathFactory = XPathFactory.newInstance();
            XPath xpath = xPathFactory.newXPath();

            // STEP 4: Compile and evaluate the XPath expression
            XPathExpression expr = xpath.compile(xpathQuery);
            NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

            // STEP 5: Iterate through matched XML elements and extract role information
            for (int i = 0; i < nodeList.getLength(); i++) {
                Node node = nodeList.item(i);
                if (node.getNodeType() == Node.ELEMENT_NODE) {
                    Element roleElement = (Element) node;

                    Role role = new Role();
                    role.setRoleName(getTagValue("name", roleElement));
                    role.setCategory(getTagValue("category", roleElement));
                    role.setMinExperience(getTagValue("experience", roleElement));
                    role.setDescription(getTagValue("description", roleElement));

                    // Extract nested <skills><skill>...</skill></skills>
                    NodeList skillNodes = roleElement.getElementsByTagName("skill");
                    List<String> skills = new ArrayList<>();
                    for (int j = 0; j < skillNodes.getLength(); j++) {
                        skills.add(skillNodes.item(j).getTextContent().trim());
                    }
                    role.setRequiredSkills(skills);

                    matchedRoles.add(role);
                }
            }

        } catch (Exception e) {
            System.err.println("[XPath ERROR] Failed to query XML: " + e.getMessage());
            e.printStackTrace();
        }

        return matchedRoles;
    }

    /**
     * Helper to get text content of a single child tag
     */
    private static String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        if (nodeList != null && nodeList.getLength() > 0) {
            Node node = nodeList.item(0);
            if (node != null) {
                return node.getTextContent().trim();
            }
        }
        return "";
    }
}
