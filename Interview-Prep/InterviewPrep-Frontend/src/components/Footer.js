import React from "react";
import { Link } from "react-router-dom";
import {
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaInstagram
} from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const SocialLink = ({ href, icon }) => (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-secondary/10 text-muted-foreground flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110"
        >
            {icon}
        </a>
    );

    const FooterLink = ({ to, children }) => (
        <Link
            to={to}
            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
        >
            {children}
        </Link>
    );

    return (
        <footer className="bg-background border-t border-border/50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">

                    {/* Social Icons (Left) */}
                    <div className="flex gap-4">
                        <SocialLink href="#" icon={<FaFacebookF />} />
                        <SocialLink href="#" icon={<FaTwitter />} />
                        <SocialLink href="#" icon={<FaLinkedinIn />} />
                        <SocialLink href="#" icon={<FaInstagram />} />
                    </div>

                    {/* Links (Right) */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-8">
                        <FooterLink to="/">Home</FooterLink>
                        <FooterLink to="/about">About</FooterLink>
                        <FooterLink to="/services">Services</FooterLink>
                        <FooterLink to="/team">Team</FooterLink>
                        <FooterLink to="/contact">Contact</FooterLink>
                    </div>
                </div>

                <div className="border-t border-gray-400 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {currentYear} Interview Prep | All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
