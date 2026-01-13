import React from "react";
import { Link } from "react-router-dom";
import {
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaInstagram,
    FaGithub
} from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const SocialLink = ({ href, icon }) => (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
        >
            {icon}
        </a>
    );

    const FooterLink = ({ to, children }) => (
        <Link
            to={to}
            className="text-muted-foreground hover:text-primary transition-colors text-sm"
        >
            {children}
        </Link>
    );

    return (
        <footer className="bg-muted/30 border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Social Icons */}
                    <div className="flex gap-4">
                        <SocialLink href="#" icon={<FaFacebookF />} />
                        <SocialLink href="#" icon={<FaTwitter />} />
                        <SocialLink href="#" icon={<FaLinkedinIn />} />
                        <SocialLink href="#" icon={<FaInstagram />} />
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-8">
                        <FooterLink to="/">Home</FooterLink>
                        <FooterLink to="/about">About</FooterLink>
                        <FooterLink to="/services">Services</FooterLink>
                        <FooterLink to="/team">Team</FooterLink>
                        <FooterLink to="/contact">Contact</FooterLink>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                    <p>&copy; {currentYear} Interview Prep | All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
