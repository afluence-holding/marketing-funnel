const LANDING_HTML = `<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
        <title>Plan 90 Pro — Germán Roz | Chef Nutricionista</title>
        <meta name="description" content="El único programa premium de 90 días con acceso directo a Germán Roz, nutricionista personal, menús a medida e IA 24/7."/>
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,400..700&family=Plus+Jakarta+Sans:wght@300..800&family=Caveat:wght@500;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --charcoal: #303841;
                --charcoal-deep: #1f262d;
                --charcoal-soft: #3c4651;
                --orange: #FF5722;
                --orange-deep: #e64a19;
                --orange-soft: #ff7043;
                --gray-light: #EEEEEE;
                --cream: #f6f1ea;
                --warm-white: #faf7f2;
                --line: rgba(48, 56, 65, 0.12);
                --line-light: rgba(255, 255, 255, 0.12);
                --font-display: 'Fraunces', serif;
                --font-body: 'Plus Jakarta Sans', sans-serif;
                --font-script: 'Caveat', cursive;
                --container: 1200px;
                --container-narrow: 920px;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            html {
                scroll-behavior: smooth;
            }

            body {
                font-family: var(--font-body);
                background: var(--warm-white);
                color: var(--charcoal);
                line-height: 1.55;
                font-size: 17px;
                -webkit-font-smoothing: antialiased;
                overflow-x: hidden;
                padding-bottom: 80px;
            }

            img {
                max-width: 100%;
                display: block;
            }

            /* ====== UTILITIES ====== */
            .container {
                max-width: var(--container);
                margin: 0 auto;
                padding: 0 24px;
            }

            .narrow {
                max-width: var(--container-narrow);
                margin: 0 auto;
                padding: 0 24px;
            }

            .eyebrow {
                display: inline-block;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: var(--orange);
                margin-bottom: 18px;
            }

            .eyebrow.dark {
                color: var(--charcoal);
            }

            h1, h2, h3, h4 {
                font-family: var(--font-display);
                font-weight: 600;
                line-height: 1.05;
                letter-spacing: -0.02em;
            }

            h1 {
                font-size: clamp(36px, 6vw, 72px);
            }

            h2 {
                font-size: clamp(30px, 4.5vw, 54px);
            }

            h3 {
                font-size: clamp(22px, 2.5vw, 32px);
            }

            .accent {
                color: var(--orange);
                font-style: italic;
                font-weight: 500;
            }

            .strike {
                color: rgba(48,56,65,0.55);
                text-decoration: line-through;
                text-decoration-color: var(--orange);
                text-decoration-thickness: 4px;
                text-decoration-skip-ink: none;
            }

            /* Override .strike when on dark backgrounds */
            .offer .strike {
                color: rgba(255,255,255,0.85);
                text-decoration-thickness: 5px;
            }

            /* ====== URGENCY BAR ====== */
            .urgency-bar {
                background: var(--orange);
                color: white;
                padding: 12px 24px;
                text-align: center;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.02em;
                position: relative;
                z-index: 100;
            }

            .urgency-bar strong {
                font-weight: 800;
            }

            .urgency-bar .dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                margin: 0 14px;
                vertical-align: middle;
                animation: pulse 1.4s infinite;
            }

            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                }

                50% {
                    opacity: 0.4;
                    transform: scale(0.7);
                }
            }

            /* ====== NAV ====== */
            nav {
                padding: 22px 0;
                background: var(--charcoal);
                color: white;
                border-bottom: 1px solid var(--line-light);
            }

            nav .container {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .logo {
                font-family: var(--font-display);
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.03em;
                color: white;
            }

            .logo span {
                display: block;
                font-family: var(--font-body);
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.32em;
                color: var(--orange);
                margin-top: -4px;
            }

            .nav-cta {
                background: var(--orange);
                color: white;
                padding: 10px 22px;
                border-radius: 999px;
                text-decoration: none;
                font-weight: 700;
                font-size: 14px;
                transition: transform 0.2s, background 0.2s;
            }

            .nav-cta:hover {
                background: var(--orange-deep);
                transform: translateY(-1px);
            }

            /* ====== HERO + VSL ====== */
            .hero {
                background: var(--charcoal);
                color: white;
                padding: 50px 0 80px;
                position: relative;
                overflow: hidden;
            }

            .hero::before {
                content: '';
                position: absolute;
                top: -200px;
                right: -200px;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(255,87,34,0.15) 0%, transparent 70%);
                pointer-events: none;
            }

            .hero-pre {
                text-align: center;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.22em;
                text-transform: uppercase;
                color: var(--orange);
                margin-bottom: 18px;
            }

            .hero-hook {
                text-align: center;
                font-family: var(--font-display);
                font-size: clamp(44px, 6.5vw, 76px);
                font-weight: 600;
                color: white;
                line-height: 1;
                margin: 0 auto 44px;
                letter-spacing: -0.025em;
                max-width: 800px;
            }

            .hero-hook em {
                font-style: italic;
                color: var(--orange);
                font-weight: 500;
            }

            .hero h1 {
                text-align: center;
                max-width: 820px;
                margin: 0 auto 18px;
                color: white;
                font-size: clamp(34px, 5vw, 56px);
            }

            .hero h1 .underline-orange {
                background: linear-gradient(180deg, transparent 65%, rgba(255,87,34,0.4) 65%);
                padding: 0 6px;
            }

            .hero-sub {
                text-align: center;
                max-width: 620px;
                margin: 0 auto 0;
                font-size: clamp(16px, 1.4vw, 19px);
                line-height: 1.55;
                color: rgba(255,255,255,0.72);
            }

            /* VSL slot */
            .vsl-wrapper {
                max-width: 900px;
                margin: 0 auto 50px;
                position: relative;
            }

            .vsl-label {
                text-align: center;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.3em;
                color: var(--orange);
                margin-bottom: 16px;
                text-transform: uppercase;
            }

            .vsl-frame {
                aspect-ratio: 16 / 9;
                background-color: var(--charcoal-deep);
                background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAKcBLADASIAAhEBAxEB/8QAHQAAAAcBAQEAAAAAAAAAAAAAAAECAwQFBgcICf/EAGcQAAEDAwICBQYIBwoJCAcGBwEAAgMEBRESIQYxBxNBUWEUIjJxgZEIFSNCUqGx0RZUYnKSk8EkMzRDU1WCorLSFyU1RGNzlLPhCTZWZHSDo/AYJidFdYTCN0ZllbTi8SiFpNPjZv/EABsBAAMBAQEBAQAAAAAAAAAAAAABAgMEBQYH/8QALxEAAgICAwACAgICAgEDBQAAAAECEQMhBBIxE0EFIhRRMmEjcRUGB5EzQlLh8P/aAAwDAQACEQMRAD8A5bdKuvvN3mvV8r6i6XSc/K1dS7U8j6LexjR2NaAAmgEvCMNUFCAN0YG6cwhpQAjHglhqUAjwgBGkdyGkdycAR4SsBvHghp2Tun1I9KVhQ0Go9Kd0oaUhpDWkdyPSO5OYR49SBjRaENKdwhhAaGw3KGkJzCPCBjWkdyGlOgHwR48EANaUWlO6UNKBUN6UC3wTmkoEIAawO5DSnMIAIFQ3oHchpHcncIt/BAxsNHcj0hLwfBAAoGI0juSgPBKwlBqLEIwhjuS8I9KGwoSAjwlBqMNKWxiNPgklngntJR6fUiwI5aMckWkKRpSdJRYUMOaO5J07p8tKTpKLFQyWIi1PFu6LCYUMkeCTpHcny1FhFhQzpHckFoT5aURCdhQxp2SS0J8tSSEWJoZLQiLE6QiITTENFuyLSE6Qi0p2A3p9SItTuEWE7Aa0+CGnwTuEAEWA1p8EelOgIe5FgN6UNITmEMFFgNhoR6Ql4R4KLFQgNR6R3BLAKAG6LARpHcjAHcl6T3IwErARp2RhngErCVhFjEaR3IADs2TmEYaUWFDelGGpzCPCLAb0juRho7k5hHpKAGtKPSnMIYRYDegIy1OYR48EWA2GhHpCWGo9KAG9KGnfknQ1DSgBvSEekJzSUekoAa0hGGhOaUNKAG9PghpHcndPgj0pAM6fBAhO6UlwTAjVMgjYSVHs2p/WVDt9Z28AE1dXucBC3Gp50j9qn0bAyINA2AwE0JllR7k+pLlHns/OCRRbvPqT0w9E/lBUSO4QwlIYQAnCLSO5LwhhAhBA7kANkvBKGkhAxsjdHhLx4IsFAxBG6GEvCGEAIwhhLwhhNAIwhhLwhhBIjCGEvCGEIBGEMBLwgiwEgI8IwjTAThDCUgkBHjH7rm/Nb+1PYTbR+7pO4xtP1lPYTAThDCVhDCdAIwhpS8IYQA2PUgl4KGECEYQwlYRYQOwsIYSsI8JCbEY8EBjuSiEWEAmJxuiIS8IYQhjeAhhKwhhMQnCGyVhFhAqE7IFKwhhAyDeRm1zHuwfrCljdoPemLsCbVU7cmEqTEMwsPe0fYkMThDCUcAZJAHigMOGWlpHeDlAhOEMJeEWEDEkIiN+1LQQIRhM1dLT1cXU1MDJY85w4Zwe8doPiFIwhhAFE1KCIFKBWRqGAEYG6IEJQIQAfsTlNBNUzsgp4nyyvOljGNy5x7gAnbfS1FfWxUdJEZJ5ThjR/55Lvdo4PouE+GDUU7aarqntjMswc3rXlzm4aN9m5I29eUoxsbOa2jot4nrImy1Daaga7smky/wDRbnHtKsZuiC9MZmK6UEj/AKJa9v17q8uMV3tlfcr8amphppHCR0TQHOYdwA3fBJJaOSrm8RX93F9HZr9ZprZWVLXOpnF0cwm0NBc3UDhjgA4gb/fMpxi6a2axwScXJPRguJuH7lw5WR0t0ZFG+UF0RZK1weBzIxv9Sq8LZ9J9puXEN3ETqWZvkrtIlbUgyEaDJqIyG9rdhzweWVUx8NV7+DxxHGNdMybq5G6CHMZya8jJ5nY793ep7XKjPwo8IbJaCoZ0Lot6Ka/j20VdypLzR0DKWfqXNmhc4k6Q7OQQAN1bcS9AfFlttslfa6633xkYJfFS6myYHPSDkOPgDnwWw+DgP/ZBxkPypv8A9OsT8GC83Cg6SqG1w1Eooq+KRk0AcdBIYXNdjkCCOfiqpEbOWFha4tcCCDgg9hQ0r0jSdGFmv/TlxTUXGDVaKF0U7qZhLRLNKzUWnG+NnEgc8hXNFwtwnx3TXKyz9GtZwq6nb+4q99GIC/fAcCAN+R0uzkFLqO0eVcYR49Q9fJehuiTgOyUHAdx4nruGxxVeqaqngFD5rg0xv0FrWu21c3ZIJxjCoelxvR7cOEI7hRWj8FeKmOaX2p1M+Fz26sOBGkNO2HBwx4o6h2Mj0mdHY4Ltlnrfj+jufxkwu0QtwWYAORuct3xnZYUt28F6W4+4Q4XpOI+jWCmsFuhirqzq6pjIABM3Q06Xd4ySVM4in6LuF+kik4XfwFST1NyETZJuoYYotZ0sAY768Y9qfUOx5s4ds9Vfb7Q2aiDTU1kzYY9XIEnmfAc/Yu5u6FOj2hudJYLrxxWC+1TR1UEZiaXk8sM0kgbHGSrSmtXC/AvT/TWynsEUzLxHFJQkYxQSZeHubnfBx2csqz42vdjd032Gwt4ejbeW1lPM66+bqdHof8ny1JpUJs4H0r8IwcFcZTWGnrJaxkcMcolkYGk6hnGB3K9sXRzaYejh/GnF95qbZFKT5DSwMY6WoHZs7tcc48BkrbdJVFwrW/CHlj4vqJWW5tDAWwxMe51RJjDY/MBdjmdu5bOy2LhTi+atsFX0XVNnt0DD5JcJqbqTJggZacB7XbgjOc43S6hZ5NeBqOkHGdsndFpXonod4O4VZw5xk3iKz0tzbabhPEZnxAydXGzJ0nmDseWNyrjgql6MOknhOvmZwTDaobY8B/VtayXSG6gQ9m5yAcg/8Uuo+x5e0hFpXpvhKk6N+k/hi9W+18GQWZ9vjAgnEbGyjLXaHhzd+Y3Ds+KxPQ1QcDwcPVdwuFjquKuJI3O0WuKkfK1jAcDsLMnc5d2ckdQs41p9a0dx4H4jt/CFLxZVUUbLRVaOpmFQxznas6fNByORXdOPuFOF6ro/h47k4IPD9bbp45qm3GNsZmibKA6NwHmkOG4djPer/i3iXhem6EbZe6nhKKotFQIhBbDo0wF2rSRtp83fl3p9Q7HkoBBejOAuBbHwt0cUnFdy4QqOK7xXtbJHRshEoiY/doDT5oAbglxBOdgq3pq4Gsc3R9TcdWawTcPVTXMFZb3xdVhrnad2cg4HG4wCCl1DscRstrrbzdaa122ndUVdTII4o2/OJ+wdpK7LB8Hi5GFkU/FlqiuL2axTCJzgPbkEjxAXLuCOI67hLiGC+26GmlqoWvawVDC5g1DBOARvgrpXRJR8Q9IPS6ON63FPDQzNnqZmAtYCG4bCzJ7RzGdhnvCI7B2c5ufBnEVBxdLwobdLUXVjsNhgGvrBjIc0/RI3zt4rVXPoa4otHBtw4lvU1HQto4es8lDuslfuBglvmt595UnpP4/m/wAMFTxHwtURsdRxeRwVJjDw8Bpa5wB25k4PgFv6K8XS/fBfvtxvFdNW1cnXB0spGcCVuBtsAO5CS2gtnm/A5IYThau1dCvCnDFHwHc+kPiugZcIqVz+ogkaHMDWYBOk7Oc5xwM8lKVlXRmejDo3oeL+D75fKm51VLJbdeiONjS1+I9e5O/gq5/R4G9E7OPPj+iJc4N8h0+d6enTqz6fbjHJd64AvnDHEHR3xRXcOcPCxDqpm1UDQ0Nc/qThw07cu4Bc7l4dsQ+C7DfBaaMXQ6f3X1Q6zPX6c6ufLb1KqVE2zh5bgZyiLcL0XwvBwHaeHbeeHOAq3jiomw2srPIS4NcANRDpG6cZJAa3u3Vd0u9GnDdLx7wpFbo/imhvtT1FTCw4EZBBy0H0SQ7GOQKXUdnAyEnSvV19tXA/Ctzg4frejAPsL4cy3ryXr2xuwfTcAXgjtORz2XnTpBpeHaTiysi4UrhW2cuD6eTzvNBGSzLhk6TtlDVCTM2R60kgLccLdF/GnE9mjvFltUVRRyOcxr3VUbDlpwdic81nOJrFcuHL1PZ7vTtgrKfHWRteHgZAI3Gx2IRQy26N+j+/ceXGSltDI4oIAPKKqbIjizyG25cd/NH1LoV0+DneGUMslo4mtlxq4hk0xYY9R7g7JwfX9S0fR/LJw/8ABYu93trjDWzCd5lZs4OLxGDnwHJYzoZ4O6S6J9NxtwjTW6SGpjkYBVVOGytyWnW0YJ3GRvzCqhWcirqWoo6yajq4Xw1EDzHLG8YcxwOCCO9MYXf+EOj6t416Zb/U8eUdLEaERTVtNRPPVSyvaNDcg5xgZO+5W0oeF+DuOHXLh2p6MK3hmOnYfI7k6iEBkwcBzXAA55HS7OQl1DseSyMpOAvTPRfwlwXbOiq9XLjOwUde+03CqjqJ/J9UpbE4ABp5+zPb3Kb0ZU/Rxx/deJLnTcFUMFBTQQRthmpI2lpxIXOaG7Akad+ewTSFZ5YIRY3wvVPRxB0V9J1sulmo+BIbXHbwwCTQxszmOzh4kb5wPm75J9qRwBD0U9IpvHCdu4Fht7LfHiKqdGwSvbqLNYePPDs77k5ToR5ZIRY2yuzdDdm4DpH3mTiC3VXEl/o55Y6O0w0kkwe2PbUQ0FuXHbLthhbnjvgzh3ifomunEw4EfwbeLfHJLHEYmxucGYPnBuA5rhtuMghCQ7PMGEML09Pb+jnhXoa4Y4svfBVJcqh8NPhscTWumlcw7yE7EczvkZ7FS9N3D3CF36IrV0hcNWOCzSSvj1RQxNjD2PJaWua3YkOGxCdBZw3hazyX/iS3WSGZkElfUsp2yPaS1hccZIG67LJ8Gq8MeGP4xszZDya6neCf6y5r0Qj/ANqXC/8A8Uh/tLu/T70T8Vcb8dU14sgt7KZlGyAyTzljmuDnEnABOBkckIRwvpL6OeIeAK6GC8shlp6jPUVVO4mKQjmNwCHDuKyOF6c6e2QV9m4N6MIrlFXX99VTxzSE6nRgR6C9/aNWc45kBI4rqeifoqraDhKr4MhvU0sLX1lZNEySRjXHGol+5JwTpbgAYRQWeZg1HgLvvSNwvwd0Z8d2viZ1hZd+GbpTyhtvdhzY5sAgt1/NwcjO43W74Jp+jTiDg2r4urujm12O004c5stVTxHrWt9JwAHLOw7zsEUFnkfCGFbcU1dvuHElxrbVRNoaCepfJTUwAAijJ81uBy27FW4SKoR7EePBKwe5GGoEJwEAEvSe5GBugAgENkoI9PegAsBDARgI8FABAIY8EoAo8HPJACQEeAlAI8IAQAlYSgO5GAgBOPWhpS8HuQAPclYCA1HjZL0owErAQAhpCcwhjwTvYCAPBHhKA8Een1IbARjwRYTmEWErAbwo9S4NHNSXYCrrhJoY53cE0wIcI62tdId2xjSPWVbxgABQrbCY4GBw3d5zvWVYNCpCJVEBr/op+YDb1j7U1Qj5Q7fNUiceaD6vtTRLHNkPYl4QwmAj2IexLwiQAn2IexLwhhACPYh7EvCGECEYBREeKWgUDEYQwlAFDBQMThDCVgoYKBCcIYSsFDBQIThDCVgoYToBOEMJWEMIoBOEMJWEMIoBgDFcfGIfaU9hNkHy8H/RftT+EwEexD2JeEMFFgIwERASyi7U0AjCJ7mtxnJJOAAMknuA7U5hds+Cpwtb6+qufFVdBHPPRTtpaLUM9S7QHPeByzhzQDzG/ehhRR9HPQjf+IuqruJHS2K2O3EOkeVzD807Rjxdv4Km6deGLPwjx7BaLHTvp6R9sinLHSOedZfI0nLiTvoC9faRzC829PtXw/QdPFqquKre6vsos8TaqJrnAtBkmAf5pBOk74B3U2M41hDC7Jdejbg7gSluHF/E1bNe7A/S2zW9geySV0jctbK4Y5dh2GNzvsuNRZ6sZGD3ZzjwTJaARsiAHqSyhjZAIbK3PCXCPCU/ALuMeM+ILrbaOS5Ggp2UEAkOoA7u8xx3w7wAA7SsQVvLgSPgv0OkAk8WOAB7yJAEDQfxT0H/APTfi/8A/L//APQh8U9B/wD044v/APy//wD0Ky4ws3RdwY53CF9t96qL4Le2pfdoJeU7mnTGGasBpI5YI5ZPaqrgqzcJWvo5PHvG1tq7xFPcfi+loaeXqw0gHVISCMnzXEZIxjxSGWNo4H6NuJ23Gk4R4x4gmulJQyVjWVtEGxFjCM5zG3mSBsc75wcLllO8SwRy/TaHe8LrnQsbAek/io8L+WfEx4dqDTeV/vg86LUD4A5Azvhchtw/xfT4/km/YmhMewEMbJWEeNkxEW4M1W6pb3xO+xaLo+4Ov/GbfJ7DStndBA18r5JAxjAdhue09yo6luqkmGOcbvsXVfg/zx3/AKP77wE181HV1lL5dT1MLy0lzA0aHEdmQ31glJjLHhrhNvRhba/irjemtklwERhtNtkeJjJMfnnG2MevAyeeEu522n6XuFaK42Cls1BxVQPfHW0EWIRNEfRc3PYNsE95GRss90c2Oy1nDl5444zNZcLfayyGOkbM4unldjALicgec0DcDfwUni6ycL3PgL8POC6OssppKttLW0bpSQ0uxhzHZz85vI757MJAZfjTo/4o4PpKaqvtAyGCocWMfHM2QB+M6XY5HG/istgYXXuLqpvD/QVZLFUuqK+t4hcLiZJ5C4UzQWu8zO+d2jfvcfBckI25JgN+xD2JeEMIsQj2IexLwhhMZT9Ww/NCU2Jn0QllGFgaCBGz6IShGz6ISwEeErGkabgvhKe/005jnfTxSO6k6SG9YBhxbqJGkZx3r0BxXUCPhh7XRufrZC0NDo3AnUzbYA9wyucdFbaZvBrXSSwNc6aTU10gBPnbbLd1FD5XTdRqYG5YXHUdg1wJx7lrFJRE3tGEjtvE8lRLKG0r7eKnr/JpIgBoaXO05Duzzd8EjCyty8sufH0lO2GsoaylZ1lO8wFjmOMYjcG4dyAPpcjqK646ppqt1X1R10sEzqfS043A87fu3wuE9AUrp+J+KnvuVRMIS2npzPM6RzYWSyvwNR5YjAx3Fccodn3T8OyHIcYOFel9xjRSzcQUkssVRqIbDPTiojcHnDiXs1ZIdpcM5GDhbLhCniqei25UrY/JWSQOHnaXYAZk7DA7Dt3p2iqqasmjuMzI+oeTCHAZ0uxtk9g5+9TInth4UvYbHExnVzaRHjTjqz3LbEk3ZyTtM4LTPp6mBk8GoxSDU0nY4ToiZ2hVnB8sk3D1NJIXFxL93HOwe4D6sK3Q9MpbPQ/wYqPyzo24loI3sjfUzviDncgXQhuT70fAnR9ZOiiuk4r4r4koZJqeFzKaKEEbkYJAJy5xGwAHavPcUkrBiOSRgPMNeR9iJznPdqe4vd3uOT9aOwup3/oZ6R6K4cf8S/Gs7aA3yZs1I6RwAYWDQ2Mk7atOMdhIK001q6R7Y6rr790nW+js0Mb3R1DaRms7HTqDm49eCSeQXlrA7QClvllewMfLI9o5Nc8kD2FCkLqd16KrW+78NVt04M4xqqPi59Q6SugnkHk07tZOsxFpOHN5Hs5K26c6mOPolit/GVVa6rikyNMPkg9F2rdwB3A0bHkCV51jc+NwfG9zHDk5ri0+8JL3ue4ue5z3HmXEkn2p9go9Q9IwaeKOiw5Hm1+ef+jYsN0vtafhGWRxPz6Ht/0i4yZZXFpMshLdwS87eruRl73P1Oe9zuwlxJ96Gw6nojpJDT8JPg15I2iZ2/lSKr4wa0/Crsz8jnT9v+jcuGOkkc4PdJIXDk4vOR7UkvkL9ZkeXDk7Ucj2pdgo9NRVNlpfhLV8lzkgjqJLTCyjfKQAJNsgE8nFuce1aXhC18Y0HGVwreJuLKatoakPFBQRgN0t1Z1YIB2btsXc+a8gvc55y9xce9xz9qUZpi4OM0pc0YaTIcgeBymph1PSXBELqfh/pSikGl3xjWkg+MRI+1Z74MTWs4G4vGeYb/uXLholl3HWyedz887+vvRMfIwEMkewHnpcRlLsFHcvgltayj4o35xwf2Xq66HQ+u6HKq08G3OjtvEnXSddLIAXNd1mdRGCcFmADg4XnRkkjM6JHszz0uIz7klkj43643vY7lqa4g+8IUhtHqLjW33in6Ar3bbze2Xu6xQuNTOwjYiRri3s9Ed4HqVNSWB3H3wdrPZLRcKSOamEZmMrjhhjLtTTgEg77Lzt1kmHDrJMO3cNR39fegySWNrmxyyMDvSDXkA+vHNOxdT09wXe67i7ott9u4T4jprTxDbo44Jmysa/OgacFpBOlwAIcAsb0zM4ttXATaDijjylrq6snAktsNMwB8YIIIdpDgQQCSQAeXr4nG5zHB7HOY4cnNJBHtCN7nSPL3vc9x5uc4kn2lHYKLTgHhd3FPF1BYm1QphUvOuUjOlrQXHA7TgbeK9OcX8EXgcDU/B/AlVbrPbywsqpZnv62Rp5gFoO7ubnc+zkvJ8ZLHamEtI5FpwQo7Kio1n90T4/1jvvS7UNo1HSTwHcuBLhSUVxrKOpfUxGVhptWGgHGDkBdS4UwPgoXkEjnP8A71q4U8vkwXve89mpxP2pQMgZoD3hn0dRx7kk6HQxpXfOhSag4u6JLx0ey1sdLcCZDFq5lriHNcB2gOGCAuElozyRs1MeHsLmuHItOCPaEougas9QdH3BVRwN0d8TW6vuVFWVc8Msr2UxOIh1JABzg74zyCyjiz/0R6dsm7cs1Ac8eU7rhTpJgXHrZcv9I6zl3r70kveY+r1v0fR1HHu5KnMXU9Y8Q0d94h4bsknRxxVb7LZ4o/3Q9oGRHhuMbHGkZy06d+ZVD8IGns1VV8Euv9ZOLOamSOoq6d4Dm6o26X5AO2RnPcvNbXyMY5jJHtY70mtcQD6x2pL3PewMc97mjk0uJA9iHMFE9cWG1caWniCnmo+LqK6cGFgcXV8nWVLW6fmytaAd9wSeS849NtTYq3pJuk/DxhdREsDnw/vb5Q3z3NxtjPaFlS+URdV1snV/Q1nT7uSaLe5DnYKNFpaeLOKbRRNobXxFc6KlYSWwwVDmNBJyTgd5VZdK6uuldJXXKsnrKqTGuaZ5c92BgZJ8EghJISsdHcugTiGxXjga6dGnENWykFUJPJZHvDQ9r+bQTtra7cDtytR0adGvEvA3EMNyu3G1O7h+jbJophPIyN4c04Ja4hjcZ1dvJeY3NBGCAUcss0jBHLNK9g5Nc8ke4lUpEuJ6T4G6ROHB038Uwi5wigvHUCkqydMbpYmaS3Ue/JweRwrqez9JlBWVVfeelG30nD8TXvZUNpI+sxvp1BzdPdnBOcbDdeTHNByMZylSSzPYI3zSvYOTXPJaPYThCkHU9EcNVctb8GfjGrqattXPPU1r31AboEpLm+fp7M88eKh/BHIFj4wBIGWxf2HrgAfIGGMSPDDzaHnHuSWySMz1cj2Z56XEZ9yLCjvfwOCG3HijUQPkYftemvgj4HH3ExJG9N3/AOmK4RG+SPPVyPZnnpcRn3JLHyRkmOR7CeZa4j7EKQdT1B0JSw1PCHGFq4buNFb+K5LnVkSTAFwy49W/HNzQMjYHBzstBPauJaPoU4otnEnEMV/vRpKl0j43D5IGPLY+QPIE7gc14+a97JBIx7mvHJzXEOHt5oxNNlzuvlBfu46zl3r71SkLqeg+l1zT8GDg4AjnR/7pyTxaR/6H9kbnfMH+9cvPrnyOYGOke5g5NLiQPYiMkhjEZkkLByaXHHuS7BRpeiPbpR4ZJ/nOH+0uv/CC4zvvCfTLaay3XGrFLT0kUslG2ZwhmGt+oObnBJbsvPTctILSQRyIOMI3ue86pHveeWXOJP1pLSBnpPplpqCC7cKdNFjY2opWTU7q4M5vjJ8x/wCdglh9il9JnRfF0q3+38X8N8RW/wCL6injiqHOy8hrTzbp+dg4LXYwQvMXWSGPq+sfo+jqOn3ckqKaeJpbFPLG13MMkLQfXgquwUemekWnsvSH0jcNdHVDcI30NmifUXCWN+dmta3qmkbasDc9me8LRdMXR/xNxZaqDh3hy4Wi02CkY3VTvc8GRzdmjDWkaGjkO07nsXkKNzozmNzmHva4g/UnfKKj8Yn/AFrvvR2ETeLrHU8N8S19hq5oZp6KXqnvizoccA5Gd+1VYCW4lzi5xLieZJySgAErHQWEMJeEAEkAnCMDwR4RgJ2AQCPSl4RjklYUIAR47kvA7kYA7kJjoRhGGpeAhhIKE6UYalaUoNHciwobwlAJenZK0oChvSj0pzT3oaQgdDelKDdkrSjwEBQghANTmnwQx4IChvShhLx4IY8EAhGERCcwkv2CBkWc4BVXUN6+pZDzGdTvUP8AirKpI0nKh0DNRknPN5w31BBJJhG6fAwUmNuAnWhXERIoR8tj8kqROMM/896ZoR8t7CpNR+9/+e9WiRYGyPCMDZHhACEMJWAjx4IAThDCVhDCAE4QwjIQQAkhFhLIzugAgBIGyIhKwhhAhOEMJWEMJgJwhhKwhhMQnCGErCGEAJwhhKwhhACcIYSsIYCAGHD92x+MZ+0J/CaeMVkJ/If+xPEIALCL1FGhhOgElElYQwgGJXSugbpDo+CbnWW+9kx2i4PbIahrdXk8oGNTgN9JAAOM4IHiub4RYCBWe7KGspa6kiq6OoiqKeVuqOWJwcx47wRzXnjp2udDZOny03i42dl4gpbRE8Ur3hoMnWTaHZII8074IXN+COL+IuC63yiwVvVwPcHTUUo1QTetvzT+U3B9ak9JnF0nHHE8d8ltzaBzKOOl6oS9ZnS5zi7OBzLz7AFNDsvKHpcv09xu/wCFdHDfrLdWFktrLtDIBjDRE4g4Hfncnztiucxt0sA7vHKdQwE6EJwiKXhJQAkhbq5mNvwXqISyNY08VvGonHzZFhyNlqeDOkPibhK1SWq2NtlTQvmMzYa6l6wRvPpFpDgd/HP1psaLCp6XrXX2oPu3CVjuPEbaA28XaeVrmuiPa6Mjd3bz553AOFUcC9INrsXDtTwxf7NQcS2KadtUymlqAx0UwwdQO+QSAcevvIWj/wANXGP808Kf/lz/AP8AyI/8NPGP808Kf/lz/wD/ACJUBK6Gb9BxJ0q8WXeKjoKAVHDtQW0tHgMjaHRAcuZ23OBkrkluH+L6f/VN+xdJuXTDxnWW6roW01gohVQuhfNSULmSta4YOkl5AOO3C59GxrGNY0YAGAECCwhhKwhhMBDxmN/5p+xdX+DfTPqejfiNvDkdPLxY6BsMXXuwBTu2Ok9hzq57ZDcrlgHZ3qNw3NPTW+J9PPLC8am6o3lpxk7ZCTQ0zr9op+L+imjq6bibhaK6cOXLDaqEvbJGXDZp1AENPg4b4GNwhU1l+6RrHHwtwDwgy02Ckk66dglGl8nMapDgZ7cDJOxOyqOjDjWjtkNzsHFstdV8PXOmMT2NJlML+x7Qcn3ciAcKRx1xnZoeEbdwdwJUXOG1wufLVzzDq5KlzjkB2ACfE7ZwB2IA0HH1prbN0G0Vs41ipo7xRVvVWfqpdbzFsXAkbY06h6g3tXFU9UVFRUafKKiabQ3S3rJC7SO4ZOyawihNicIYSsIYRQCcIYSsIYTGVASghhKAXMaBgI0AlY2QNGz6MqSqu0lTbaaspoHNHWhksZcXg7HGD2be9XPE/Fs/D1vmtlvbWV9a8EzV1PE4sjG7A1oJJJDgeXM4XPLZWVFuroqylkdHLGcgtcRt2jbsKHEF3PxRUUAkq32+eMmslqA0ySOcXOIaW8gHO5nwTvsuo0jo/Dt0rqboiq7ldmQwV8lLNUPiblunYbuDtw7bJXE/g/1DPjG9TyPPWMtD5A3Vzc/LScduNf1q0q+KpR0dN4ab5DQW2aF8L3dW91RJG4bjVgN7djjnlTOgzh7hiPiG+1EFRXXSkNNHFTxOGidrHOyesDduwbjuWLnGOOTOt8TLCS7KjrnDVoulNE6SWtppqSszLHTF2Hs3+aOR2G4SIGWux2K70MzzBQz5MYZnLQ9pDmjY75O3dlQ+K6Wngo4oI6+52l0QzDE6p1HJ+c0Pac4z2LJ8V1zKmdtI2Okc2Eg9ZTuLmucO3uJ35+xc2LlynOoxr/8AvSs3FUIdnIz1NTwUsDaelj6qCMYYzPIfenUeEYHau04zU8M8LW+p4em4k4iu8lrtTanySHqafr56iXGSGtyAABzJTHEPDBo7pQU9jrRfYLlEJaJ9PERK/JwWOj3LXg8wtHwzHFxH0e0Vko5Le+7Wa7PrW0NbM2JlbDIBkBziASCMEZGxWys1TwtZeMLQx9Dw9artU2WrhqY6Cp0U8NU9zeqa6ZpOglgcNQORqPgqpCbORT8KcTQXaK0zWC5Mr5mGSKnNO7W9o5uaO0DtwnouCuL5ap9NHwzdnzRlrZGCmdlhc3UA7uOnfddctFyNtvnDlvq6O1WRlHDcZII4735ZJFqhPpOJIaHOwWjVzHJc/pbrOehO4tdc5TXT3yF0gNQetkaIScnfURqA9oCOqFZn6jhHiqnoaiuqOHbpFS0xImlfTOa2MjnnI7O08k3S8McR1dodeKWx3Ga3MBc6pZA4xgDmc9wxuV1aovjZ+mOvfNdmyUh4bdCC6qHVEmlaS3njOsnbvJVr0aRUEMnCVw8poa2kitfVz3GtvRjfTPcxwNMym1BuAcDzgc885AR1QWcYtvCPFNyo2Vlv4dudVTPYXslip3OY5uSMg8juD7k1wjaBfeKbZZHzOpvLalsBk0aizPbhdGtd2bBP0U07bk2OCnmc6oY2cBsZNQQS8A7eb39izfCs9PF03UlS+aJlO2/SPMheAwN61++eWPFFUFi7lwZZJbfep+HeJZ66psrHSVdLVUBgcY2vLHOY4OIOD2bLOv4a4iZZRenWO4i2luryowO6vT9LPd48l0Sa/wBJe+F+MrRQ0tms1wjqXVDjSRti+MqVkh1xlzicu5O2PnZ5bq8kqo29IFbxw+9UTuD5bW6NkQrG5cwwBgpuozq1B++MY8UNBZyiHgrjCWkbVx8MXd9O+MSNlbSuLSwjIcD3Y3VANwCN89y61QWW7Wbo2ZDZKuiqbreacG4VBusDPJKbGRAwOeDqdzcQPDuXO+GrrQWqSWSt4et16bK1oayrc8CPGdxpI3Ocb9yTQ0xfC9Jw/WVEsd+u1bbm+aITTUfX63EkEHcYHJbefo/4Sj6Qabg+PiO61Fa6rbDNGaFrA1pYXkiTJBPLsXNYXB1dG/S1jTM12kHZo1cvUF1iWuov/SebXeWU/knl4d1/Wt6vHUc9WcIQM5tfOHL9ZYo6i6WevooJnFsMlRCWB/cAT243wjr+GOILdT01Vc7NX0NLUva2OaeBzWnVy3Pbjdbrg2+UrOFaupv1caqOPiyiqpWTS9Y9zAcveGk5I7ThX/H1f5PaOInR0FmZR3arheKwX91Q+rxKHNkjhJOkgcxhoA2GQFVIVmN4t6NKrh7j21cPS1rpqG6Txx09aI8c3BrwW5xqaTy8Qstf7DW2msrQIZ5aGmr5aFtWY8MkkYfRzy1Y3wuzs4ms9X0v3Ph+81kJtjrpDX2ysEgLaepY1hIDuQY8AtPZn1rP3Oj/AAo4cvNqtdZb/Kqbi2erkbPWRxDqHtwJA5xALQR2ZSaBMyFu6O+LKy13Wv8AimrgNtDNcEkDxJKXYy1oxzaCHHPYVHs/Bt6nq7e+42i8UttrJWMbUxUZkc4OaXN6tvzyQM7dm66RxM+G68Q9J1sttbSzTVlLRPpf3UxrZRGIy/S4uDSQByyo7bvE/pX4BDrnGaCmttHqBqB1UbupfqzvgHPPO6KQWzF2rhS1R2AX7ia9z2yinqZaejjgozNPMYzh7i3IDWg7c+eylx9GcjmX9lHVS3eWkoKWutTqKPIrGTSEDLNyDgHbsIVjXUTuMuCrXRWirofjGy1dZFNSz1bIC+KSUvZK0vIBHYcHZFbqe18McPcc2218QMq6j4oo45Zo5Wta6cynrY4iCC9oBxn1ooLMXJw5fKW7Mss9nro7k/0KUwnrHZ5Yb2jYq84X4Bvl04zpOHa+3V1udJ8pUPkgIMUPa/fszsDyyQugcH3m2iPhxldV001ZUcJTUcRnq+q+V63LY3Sg6oiWggHY7p613EUnHXAtBW0lqs8NC+qcIo7v5W+JjmHAkeSQASPNGo+oI6oOxyTjK30dt4iqKGhpLnSQxaR1Vya0Tg43JDdgDzA7iqkAJcxLpnkknLjuTntSQoKQxU5BaAkMbkJdV6Q9SKHBdjsSGF1bu5DqndylkBEkBEMR7kkxnuUs8kk47UAQnRnuSXMPcVNOO5I2ygCEWHuSS09ynOASCFQiC5vgkFp7ip7gkFAyCQe5JLT3FTnAY5JBA7kxEMg9ySQe5TSAkloKYEMtd3FJII7CoHFV/FmdDTQUj6mqmaXMYOQCrKLie6t0PudhkihecdYw4x6wVIGi37j7kDs0ud5oAySVCl4htzI9bX6m8gc4+1Vr7+K2TS3q2QsId+d6906AuojNMNbWiOP5pcN3ePgmzO6J565zXRHlI1p831pArYurbLU1ET2gZ0t5e1M1t6LqUtt5g1OB86R4AaPUgKLPS4bgZHeEeD3LLUE9dpMc9RHM3mOom3HuVhNxC0W17myRNmaMGRw1BvrHehA0XWk4zjbvQ0nGVlrY+xVfyl0us9ZUZ3Mri1gz2Bo2CsKi3fF9O668PzudoGuSmMuuKVvaMdhVUKi5AOM4RjPcnKCeGtooayEHRKwOAPMeBT+kdykZFGe5HupIAzyCXgdwQBD3Sm81L0jHJDQ3uCYEYJWPEKQGN+iEoMb9EIAi4KMDxUsMaebQj0MzyCQEUBKDVKDG/RCUGN+iEwIgCVpKlaG9wSgxv0QgCIGpQapOlvcEYa36KAIwaUelSQ1vcEelvcEARg1HoUkNb3IaW9yQEfShpUnS3uQ0t7kbAjaUkt3UvQ3uRFjfBMCGRhMzFT3tZ3KHURt0nGQgCor5CWhjDlzzpClRxCOJrGjAaMJiOAG4NceTGkj1qfpHigVCWN2SwDnCWGgBGAFUSWOUY+XHqKk1A+S9iZpB8u32qRUAdUfUVoiRwDzR6kMI240j1JWAgBGEMJeEMIARhDCXhDCBCMIiE5hDAQIR2IYS8BDATAbxuhhLLR3osIoYnCGErCGECE4QwlYQwmAnCGErCGEAIIKLBSyAgQEgEjKPCMAZR4QgI821XTnv1j6gnsJucDyinP5Th/VT2EwE4QwlYQKLAQQgBslIIsBBCGErCGAmAnCGErCGyBCcIYRoIASUMJWyJCAThDCNDCACQR4QwgLEkIYSsIYQKxOEMJWEMIsLCaPOCrrFnyJzfozPH1qzAGQq6yYEdS36NS/7UrH9E7CIhLKJMQjCGEvCGEDEYRaSnMIYCQxGMIJWMosJgVukIw1OhiPR4rGixvQjDfBOhiMNRQxoNPcjkhZLE6OWNr2OGHNI2IT2lGGooCbbZbCyhbQ3ThWhuFOCDjrpIjkDA9E4Puwr3hviHhbhiofVcOcCUlFUvZoc59Y+RrhzwQR3rLhqMMS2PsaDijjS/cQx9RVzRw0uc9RAzQz29p9pWd0penCMNyp6h2G9KMNKc0oBqdBY1pHa0H1hGGgNwGNA7gE7jxQASoLGhGMY0DHqSgwZzgZ78JwNR6UUFjWgYxpbjuwgWNPNrT6wncIYRQ7G9A32G/Pbmhp2xpGO7Cc0o9KKCxotBGNI9yLQM50jPfhO6UelFBYyI2Zz1bM/mhHjwCd0oaUUFjePBFpGNOkY7sbJzSjwjqKxrRvnG6IMaDkNAPqTuEMIoLGtAxjSMd2NkOraRgtB9YTuEMI6hY3objGkY7sJQYMEaW4Pgl6UYCdBY1KwGM5aDscZCiMaNthty25Kwkb8k71KE0FS0UmS2NAjGw3G+3NHpbgjSMHmMbJTAdA9SPCmx0FjwR4wjAQwUxEaqHyg9SEA35IVIPWj1JdOPOSYD5HgkkJbsJJGyQxBSTzTmEkhADbuaT7E4QkYToEIPJIKcdhIKYCCEkhKKIoAbISThLKSQmIThVvElZNQ2eeopnRtnaBoLxnmewdpVphUXGsT32bXH6cT9Q92EAYcQXG715ndVzSTxtwSBjSE/V09bTxdU+rqJG6Q/wA9+pvqT1n0spnhwLS46hI0+d/5ym7zcmzUrMEag0AjvIKAooJp3Mq36g1w27OSJtX5zjpAyo1Q/rJSfnE5SMFuHZwtUhWWLa12rmT4Z2TsLyHdZz83fuVUZARjsSvKcANBO3blHVBZoo6iMMOpsTjjIeDpcO5RPKczl1KyJrvnvLdQHs5Km695OA7BPPJT1LVeTx4BjlaQdQSUdisvINGdcVxEcrtyx8YIefUOSkxXB9OwSwuETHg5j1bl3dhZ+nmYS6Ysw4jYA7DwCchkDcysdGxz+QPPHh4qqCzW0HFFTQ0uJaaOXLQQxpGWHu2UmPjmPqmyTWyZjOTn76R7ViBWSxTBgcSwnmQM+9XnD9ZLAZ6eQxaJTu1wy13/APEJOI0zoFouNJdaMVdHJqZnS4Hm09xU0epc26O6yK2XyvppndTTSHQ3UdtQO2fYulYyMjcHke9ZtUMCASgNkMIAA5pQCIBKwgABKARD1pQQAY58kfJAetH2odAAJQCDUaQB4HciwO5G3cpWEwCARgIwEAEgAAjR4QwmAWPBDHglIIATjwREb8kpAhADTx4KLONipjwo04QBWNGKz+j+1SmjKj/55/RKlMCQBgHuR48ErsQC0RDHKT9/apNQMxO2+aVHpR8uz1qXMPkneoqkSw2DzG7diVjwQj/e279iVhMBOPBDHglYQwgBOPBDHglYQwgBOPBDHglYQwgkTjwQx4JWChhACcbckRHgl4KIjdACMDuQx4JeEMJgIx4IYHcl4RYTATgdyB9QS8JON0AJ9iHsSsIYQKxOEeyNDCB2MVGOupz/AKT/AOkp4gZTNUPPpz/ph9hT5CAC9iLCVhDCAsTjwQx4JWEMIATjwQx4JWEMIATjwSSPBLQQAjHghjwS8IsIChOPBDHglYQwgYjCLHgnMIiN07JoRhDAS8JJCBBbIbI8IYQFBbIbI8IYQMAAyFW2lpFRcG45VJ+wKyAUG3jFyuQ/0oPvaixk3s5JOEvCBygQnHgiKVzQwgBICHYlYQwgLEexDCXhEQgZG0juQ0+Ce0ow0qBjQaO5GG+CdDSlBpRQDQbtyRhvgngxK0JDGQ3wRhvgnQ3CPSgY1oHcgGp3SUrSkMY0+CGlPBqVo8EAMhowhpx2J7T4IaUwGdPgjA8E7pQ0+CQDRahpTwb4I9BQAxp8ENPgn9BQ0FADGlHjwT2goaCgBnHghjwT2goaCgBgtPchpKf0FDQUUAzp8EWk9yf0kIYRQDGlDSe5PYQ0koAaDfBGGp4NPcgG+CAGJRiJ3qUIN8FZTtxC71KI1mymSGmPNb5o27EePBPNZhoyOxHpHcs6LGQPBHp8E8GI9CAZXVQPXexLph5yXVNPXH1JVI3zkmAojwSSD3KQ5qS5uUgGdKSQni1JLUAMEJBCfc3ZILU0Aw4JJCecEgtTAaISCE84JJCYDOERCdLVHmqIWtcWyNLgcEA5OUhBTSRwwukle1jG83OOAqi5XG2yRGF9XC8O2w057PBQeJ7lTS08lvrJhCHkl+W7hrdxjxJWcN+jo6dsdJSxs2BLtIy89/gqpjQVURQySBkcjo3tz54xg948FQVTxM8loGTyAVpLVT3mTqYmufO/0snkPWp0dlbTYaRl2Nye1NMpKzMspJXgEjcp34slfywFpTSNG2EttN4KJZqNo4DKT2mVo81wdhQvIp2u9FbryXPzEiS3xuG7BlCzjfGMVHSOLiXnBCe6jIxgEe5aSa2tBJ0+5QJbfMHnqXNIPYVaypkfA0UxfpDg0Y7kmSV5wx2dPZtyT1VRTxPw5h59iVTUjn5c7n2ZWkWjFwaYxqdH3lTKKTylvk0j9JcDoPj3Jqphe12/LHNNMY5skeg+cHAqvSXGi4bFmkc2V7XFnpY3dt2qztvEF0tccEcNR18OQGx1Gw9WexUrJYmvMvXFhcN/E96TFO2oqTFJM10Mg0lzuTe4rPqFnX7RXRXKk6+JpY5p0yRu5sd3f8VMx4LlXC94fYL7LGXPlpHuEcoAOB3Ob3LrTAHsa9jg5rgHNI7QVLQDeEeEsNSg0pDG9KUGpelGGlACQEeEsNR6UAIDUoDZLDUYapAQAlafBLa3dKwe5UA1p8EYb4J0NRhqQDWD3IwPBO6Sj0+BQwGdPghp8E8G+CPQhAMafBAjbkn9CIt8EARy0qLO1T3A4UWduyAKgj92N/NKlsHgmS392t/NKmMbsmIRpRgJzSUYarJBTj5dnrUyZvybvUVHpm4nZ61PkZmN3qTExqEfJM27Est2S4W/Is9SUWnuVCGMFHgp7Qhp2QAxg9yMAp7ShoQA0GoY8E7oR6CgBgg9yLB7lI0FDR4IAj4PchpOU+WHuQ0JoTGMIAeCeLAi0IENEIaU7oKGgpAMlqLSn9BQ0FMBjShhPFpBRaSmA0WoAbJ3SUehAEKsGBCf9M1SMFJrmYijP+lZ9qkaCgBjShpTxaUMFADOlDSnsFFhADWlFjwT2ChhADOPBDHgntKGkoChnB7kMeCdwUMFFANYPciwe5PaShoTQhjB7kePBPaENCAGceCIjwT+hEWIAY0+CGlPaChoKAGdKAHgntBQ0FADWPBV1KCL1cG4xkRu+pW2hV8LcX+rH0oIz9eEgJRb4IgNuSe0nCGhNAM6dkWnwT2lDSUAM6fBDSni09gRaSUANaUMJ0MQ0IGMhqUB4JzSjDUhiNCMNTmEoN2SsQ3pR6U5pRhqRSG9CGhP6UNKkdjIaj0p3SgG+CAGwxHpTunwQ0oAa0oBqdDfBHpCBjIYj0p3SjDUAM6UYansItKQDelDSndKGlFANaUNKd0oaU6Aa0oaU7pQ0ooBrSiwntKGlHgDBblDSn8IsIAZ0oBqe0oBqAG9KGhOhqPSgCNUt+Rco8bVOqm/IOUaFu4SYEjRsEOrT+lFpUUOxkMwlaU7pR6EDsralvyp9SXSM84+pLqW/LFLpGbnfsUspAc1EWp8tSSxSBHLUktUksCQ5qYyM5qbcFKLNk25iYiM4JJapBYkliAI5ak6VJLEgsQFjGknsWL4gpq+krn/ABa5s2QXGNxw8ZOdu9bpzTjZYHimoqBeXS00b3TUbWtczse07nKdCMdc6yapi650EgeHHJc7kfHKrqWCorKqKmhaZJ5TgDuHefBTLjVeWVbgIxGx52aO5ano6tzGsqbrIPOmeYoQfmsbzPtKsErLjh2w09ro9AHWSkZkeRuT9ybr6c9cSR27BW5l06u4FV85LpCQDuVMno6McdlcIcO5JRj3AwnyN0oNXG/Ttihnq0CwDmNlI0pOnIweSEXQx1QIyAmn0rXHuU3AHJJIRdCcSDJQsezBYDhRprXA5pBYAfBW4GlBzQ4JqbRDxpmRr7VIGBrQSMHfxWc88F43BacFdNFN1rgzmq3iXh9kMDqqFoDsecMc10Y5s5csEYJxA05O+MjKNunmDsnKmMglhAOORTDGnYEY9q6lTRxO7LAVbnuaSHAAYJDzuF1jo5qPKeGWNa6RzIJXRML+eOeFyOBzNIY8A+rsW86ObpFQ1Io3ud5PUuDd/wCLf2ew8lM1oaOhad0YantG6PQsihnSjDU8GJXVoFYyGow1PBiVoQMZDfBGGp8MR6EAMhqWGpwNStKSAa0I9G3JOhqGlADYaj0peMIwAUUA2Go9G6dDUehADOlEWJ7ShpTAjOYo0zNirB7VGlbnZAFG5p8vbt2FTWN2CblZitj9R+xSg3ZNEsRpRhpS9KUGqiRMAxPGPygrGRnmu9RUKAfLsP5QVpI0Yd7VSEMU7cwMPglFu6cpW5pmepL0pgMaUNKf0oaUAMaEehPaUNKAGQ1HpTulDSgBrShpTulDSgVjJCLSni1FpTAaLUWhPaUNKAoZ0oaU9pQ0pCGdKLSntPghp8E6AZLfBFoT+lDSmAxoQ0p7CGlAiDcG/ucHukYf6wUkt3Sbk3FG89xaf6wT7mZKBjOlDSndCPSECGcItOU/pCGkIAY0I9Ce0hDSgEM6ERan9IQ0hAyPpQ0J4t3Q0JiGdCGhPaENCAGdCGlPaENKAGNGyGlPaURagBrShpTulDSiwGdKBantKGlIBnSq7TjiRzfpUgPucrfSq2ZuOI4PyqVw9zggCXp2RYT2lDSmAzpQ0p/Si0oAZ0oaU7p8ENKAGdKGlPaUNPggBkNSg1OBiUGpDGgxGG+Cd0+CUGpDGg0dyMNCcDUrT4JAhsNR6U6GIwxKhjOlGGp7R4oaPFIBrShhO6PFDQgdjelANTwbsj0dqAGQxDSng1DQgYzoRhuOxO6cI9KAGcHuQwU9hDSgBnGeYR6QndPghpQwGtPghp8E9pQ0ooBnT4IFqe0otPglQhjT4IafBP4QwmIY0+CGnwT+EMIAZDfBKDfBOhuUYbugZFq2jqDkKPA0ah61NrWfIH1hMQN84etIZJLUWhPaENCmgGgzwR6fBPBiMNTQyrnZ8s71pykbzOOxKlHyrvWnqRmx2UyGhOnwRaPBOVcsdLTvqJc6GDJwMlUn4QNlJENK/GObiobSLSb8LVzRnmkOwqiS7zga/JdTRucOTbL/AEfW9XOHwO/KGyFNMHBouXNykFiJjz5pBy124Kk6MgFaUZtsiFnrSTGpZYkP0xsc9/otGXbdiKCyMWJLmKlquKGCTRTUM0ni4YTLeIatzS7yLYdgO6nskV1Zelmy5x0hyik4iLaZ7mSzwgyOBxgd31LYRcQMaQKmlkZkZyN1gukKq627ishY2URBzefIHln6000HVmZqJHzXHJw9x2BAx4DkuiWWFtNQQUzR6DQPvWI4ZpJJqqKWbGp79WO4Df7V0G2xku3Tk6NcaHpYtiXdo5KFMzA9fJWFVKyNwxgqsmqGPmLQ9vfjKiT0dWNDRac4Rhqdj0u5JYjPNc1HZGIzpPchhPBu6UYwGknbCEgoj6UWExXXGnpW8i52NWO4Knm4iyRphPLOCq6WQ5JF+WZKMRqihvvWOx1Rbt61Opbi8vGogtPhyS6EORc0kQHnOSblIZKZ7Dg4CkOcDSsc3kQq64uLKSQ+CtOjGS7GAulODNMYvSZ5wH0m/eFSuGfOxgd6vLkXNqctdpcBlp+/wVXM0tfnGjJ5LqxvRxZVsRTholLQ715VtQOmAMcXplzSzwIII+vCqmADJPzsg+pWlpbJHoljb1jGNzISdmrR+GSO72yoZX2+CsYMCZgfg9h7R71J0+AVDwFc6KosFJCKyB9QdXmNfvz22Wm0LKhsYDPBHp8E8GYR6dkBYxo8EejwTwYlBiKFYyGYCMN8E8GpWlKgtjAZ4JWjwTwblHoSY0xjB7ikv5dykFqamacckUNsYJSoxkqJcquK30MtZP8AvcY5dpPYFianjK6SSHyURQN7BpyfrUzkoekudHSgzuStK5S7ia/udk17m/mtAWp4HfxBXVPlddVSeRBp0hwAMjvDwUQyxk6QlNM1mkhIfspJGyiz4ytaKsYeeaYAJJ2TzgSdkmR0VPC6aokbHG3m5ydUKyvqGfuiM47/ALE9p2WW4h4nEjjFbBjYjrXDfu2CvuHasV9lp6gnMgb1cn5w+9Spq6QuyuiYAg7fAzzRSu0hJidndaIQ9EAJGdnnBXD2cwqeIjrGfnD7Vfubz9aoCLSN/czO3ZOaUqjb+5mp3QgBjT4IafBPFqGnwKYDOnwQ0+Ce0+BQ0+BQAzp8ENPgntKGlKwGdPghp8E+GIFiYiPo3RaPBSNCGhAWR9Hgj0J/ThJLUwGSzZFp8E/oQ0eKGAxp8ENPgn9Hiho8UARy09yGk9yfLEWnCYhjR4IaPBP6UNKBEG5N/cE23IZ+sKQW9yK4M/cE/wCYU81uWtPgCgaGdCGjwT+ENKAGNCGjwT+nwQ0oERw0oYKkaURagBjBQ0+Cf0IacIAY0+CGnwT+lDThMGMafBDT4J/ShoQAxp25ItPgny3sRaEAMafBDT4J/QgW+CAGC3HYiwe5P6ENCQDGD3IYPcntKAagBnBO2FWVo08Q0Bx6UUjfsV1pVXdmlt5tLh2ukb/VTAllvghjwT+lDR4pgMafBDT4J8sRaUgGdPgi0nOE/pQ0+CAGNJ8UNJ7k+WotKAGQ1HoToalBqQxsNRhqcDErSgBkN8EoNTgb4I9KQxvSlBqXp8ErSkA1pQ0p3SjDUqGM6UYantPghp8EUA2GoBqd0ow1ADWlDSntKGjwSGhnSgGp7R4IBvggBrQhp8E9p8ENPggLGQ3wQ0J7T4IafBAWM6UNKe0+CGnwQAzpQ0J7T4IafBAWM6ENCe0+CGnwQFjGlHoTxb4IafBAWMhqMNTunwRhu/JAiLWt+Q9qj07fOb61OrW/Ie1RqdvntHikyiWWotKfc3wRafBKgGw1DSnQ1GG78kAVUjflXetSaRmxTR3ld6yplK3Y7KZFIh3KSOKEskcBqHMjkse9h6x0kL2MDXYIPNwPctDxeC1sZHcVmm5yfFcHKzfG6OvBj7KyNG2ubHKWmFrBEHEOzlxzyCFPDVT1rY6ule3Xh41Ny0t71Na7DT3EJD5nsBOpw2xzWOPlJ+mksTNJGwaGhowAMDwUuDLm4PYoNmL5be2SQkkuO57lZ0zPNJwvVxvtGzgmqYRZ4KJcJ4qSAySkAHbdWRbtyVBxu3/FTPGUJzdIUdujKVZMs0slPLHHIwFzC8Hzj3KNa4qx0somrYIA6J2NLNWo9yJ3pFOwYxkd68x8l2d3xKgQxV4bA+oET2SHSCx27cd4WR4/0srpY6d4+UIMzm8tuxbE5DsDmsZx3B5LVQnHmyt1OPecroxZuzoylDqOcLt1VDXdoZnCvbhc20cbYonkSc3OHZ4Kh4TkHXTvG5DRj1Kwjpm1tSTlxbnuXRN7HjiVFbc6+Zx6vIb9qixurHOB84n1rax2qFrdmZKZnoGtBLIhlZ9kdKi0QLVUyxjTI0lX0UjXQA9qpw1rNsYKnQSt0YCiTOiBMhIIJxyTdW8mNwacZGEunI6onCYqHDGxUpl+lHUULqglzh6Z38PBCOxCQ4JDQfSPbhW0bHYyBunGSRg41ZK07GEoEOOwwMadJ257on2rq8aXk5GcgbKwe8ac6Xj2oQTt0kZPqSciVEjW6SVjjA4l7fsT9fHrp3NAzsQnJm4ILRv34TrGF8Zdzz2JXYmjm90aRNLqGOTVVSvOHMfuOw9y1HF1G+CtNQxnyb2gPb3HvWWleNZ7l1Y3o48y2JiGe8Y+tWVscYHNI2Y4/KbZyO71Ku6xgHIqbSyjyV7WOxIcacjbmtaOf7O1cE2Cwm1UNyprfAycNz1rOZcOZWr0LPdFpY/g6mIkD3a3F3eD2grU6AoFIYDEejwT+koafBArGAzwRhieDfBHp8EAMYxzROcxkbpHuDWN5kpVR9Ec1guMLrJVTGigc5tPHuSD6bvuCzyTUFbC6N+5oCRnPIrGWji1sFneyvc6SohIbGO2Qf8ABUV14gudfIW9cYWH5kZxgLP54uNmbypHTtTM+m33quvVTdKWB01Hb46tg7BJh3uXMTUzNGXTyH1vK2nBlK+OhNyudQ6Nkn7yySQgBvf7Uo51N0hfJ2MtxFxDV3WHyOeBlPG2QOLMedkd6pNAG4wum3lnC9zJFVUU3WgY6xjsO96ofwQiqJ3Nt1yjlj0BwJ37eWQoywciZWyj4ZnoGXNvxpSySwDk4btafygt8eLbJDIyCKRxYCGgtZ5rVz+6UElpuMtFNI1zw1pJbyIO6iFhdHlpy3O6zxyWMalR2yNzZGB0b2vaeRachQa+qpaeUMnqIoid8OcAuW2+43C3P10dVJF4ZyD7FFqJZqqpfPUyOlkecuc4rb+TFIHlOsC42prNT6+mx361z3iy8SXa4ObG8ijicWxNHJ2PnFQbVaKy6VgipGxjHpF7gFHmHVamPGHMcWuHcQVGTO5R0TOetCGYzknktb0ePc6O4s+Y18bvUSDn9iyNHFLVSiOGMvycbBdI4ZtbrRZQyYDrpXGWXw7h7As8DblZOO2yTVNy1MMyO1TXMzHk8yo5jXpI3YuAnrWfnD7VqnM847dqysQw9u3Jw+1bB487l2poaIlC39zgeJ+1PaEKJvyHLk4/antKYxjQENCf0oFiAGNCGhPhiLT4IAZ0BDQntPghpSYDOhDSntKGnwRQhjShpT+jwRBvgmIZLEWhP6fBFp8ExjOhFoT+nwRaT3IAZ0o9Cd0Iy3wQIY0ItKkBvgi0eCYDGhFoUjR4JOhAmQ65maCoH+jd9idhbmCM97G/Yl1TM0sw/wBG77EdK39yQnvjb9iAEaAhoT2nwQ0+CAGtKGhPafBDT4IAYLAi0p8tRaUAM6UWlP6ENPggaGNKBblP6fBDSixMYDUeE9pRFqYhjShoT2nwQLSgYzoQ0J3ShpSsQ1oQ0J3ShpRQDBYgGJ8t8EWlMY1oKq723TcLQ7/rJb72q60+CqeJW4Nsf9GuZ9YKGInaUNKe0IaUDGS1FpT+lDR4IAY0oYT+jwSdPggBnQiLU/pRFqBDWhKDMdixbbhcPxqRLFwuH41J71l8iNejNkGo9Pgsc25XEcql3tShdLl+MH3I+RB1NgB4I9JWPN0uOc+UEexK+Nrh/Ln3JfIg6Gw0IaFkBdbiD/CD7k8283DGOtH6KPkQdDVhqGlZX44uH8qD/RQN3uBO0oH9FL5UPoarSj0rKi73D+VH6KWLxcP5Rv6KPlQdDT6EoN2WYF5uA+cz9FKF6r+9n6KHkTDqzS6UoNWa+PK7ujP9FLbe67Hox+5HdB1ZotKGlZ347rvox+5LF8rMfvcZR3QdWX+lDSqH49qhzijQ+PqkfxMZR3Q+jL7T4IaT3KhF/qCNoGe9AX6r/kY0d0KmX2lDSqRt+m7YGe9Gb9KeUDPen3Q6ZdaUNKp23yTO8DPelC9u/kW/pI7oXUttKGlVfx0f5Ae9K+OD/IfWjsmHVllpQ07qsN4OdoB70bbwc7w/WjshUWYYjDMKvF3B5wn3pYurP5E+9HZBRIrR8h7VGgb8o31pEtd12G6NIzvunYSNbDnbUEMZOc1JwniW55pJx9JACQ0pWhLbgDmlbd6BopS35Z3rKn0bToJKhS5jlJcDuVY0RDocjtUSKopuLYtVBr38x4+tY85Gcdi3t+iEturGjchgcPZusKWjWR3heVz1s7eI9CW5OR4/aExVk4aB2qQ0YAPe37CkMj66eJn5WPrXBHejqZrbXF1dtgZjGysaVnmHbtSWsDWNYPmjClQt0s5L6PCqgkePkdyY25vgs/x03FpYcfxw/atK4bZWd47GqzN8Jm/tTyf4sMf+SMG4HU7HaU7CMODfBEBl+Etn8Y76IwvCfp6opg1OcfHAVD0nUzDbLdUNJJEjoyMbb4IWigbhgJ5rP9JU+ihp6UOGl1R1r2jm3SzA95K6uNuZhl8KjhOMtbVuHJjQFf0BZTU5mk2A39aquCY9VBXuJ/jgzPfsrC7xvNM2KM4dq2Xdleww7Ga68ysZM4ai2IZe2M7MHie/wVdDxFSzPa2WCoa1zsB+rO6mQUTTYqq2vPVmUZ1ntcDnJWfobTWzObB1bhGyTU4n1jOPchRTRo5yT0jVQ0pmLgxziRza7mExHI9s/V75BVlKHz1gmaxsGOb9W+PFR/k5q8OiAwHacjt3WcqRvEmxv0xAdvaoheeuweSsXxhpIxyUOpZ8oHDsWZq/ByrbJFRawSC4diq5IagWurqQXxdSwuYAMud4q66yOoiEcrTlvokHCYbRzBskcUjtDwQQdwc81rExd0YQ3e7UsDJ21r5HF7muY8AjA5H2rT09dL18cVVGIahzQ5hb6LwU/DwlStLZJA951ZxnY9ytHWpskge8DI5HtCuVNGMFJPZIY0PiaccxunaeLBONhhFTRGMYzspLW4OVimaNFFxJRCamcdicErllVDplc0bYK7fUQMkY4HkQQuP8SxiC4StxjDyCF04WcvIWirazA35qXSujbGWvYTntHYojHnVlS6YhzwMbFdLOFbOxdDc744J7fKWnU3yiIjtbnSQfHK6RoWA6Gre9tFLWyROa1w6ppd24OThdF07qAl6MhpCPBT2jxQ0oJGdJQ0f+cJ/T4fWhpQhoqrvFL5HUOi9Pqnacd+NlysNcWAOdkhdoe3IxhZq9cI0lXI6emeaeRxy5rR5p9i4+XilkjoTOXXRjm1UTx6HV49qaMgY5xHMrU3bhy4U0skPk5qonRea9g5Z/aFR/FjIaVr3sn6zPpPbhq4Y4ZpUzncLZZcFWZl2uYdUEGCHDnszu/wAPUofFNTW1V9qoqkvaIpXRxwjk1oOwA9Sm8KXI2qqra7qDKYacN0Zxu54GT4DC0Fkvdmrb9JcLtRQ08wiAZJnUMj9q7I4qjSK6UUdq4LutZAJZGspmncCTmR6lb27g+roqjqm3F0RLesJiGDscYWr4evD73JV1ENKY6CM6IZXbOlcOe3crCONr7jNk5xFG32nJWsMSStmiic8u3Cc1zuk9RU3ZzWxgRl2gA4DRzKyl6oaG010VPSXVtcySJznnbzXA8lO6RK2+Nu1wpcTMtc0xkY5jdnNGG7nuyFjXRA7+HNZZqrRElRatqMghw5HfwTgfG7GDucAe1a3hbhygvfAzH0oa25zz6XSOPoub2erCylwoamhqpKOtgMM8Zw5p+0d4WDxvrZHW1Zo7FwjcrjVy0VTqpY4wJGzNOQSDyBCsL7wNR0MLJpqt0hDvOaNi8eK0/RoZjwtaTM/UXvma3xaCcKRf7f8AGl7jHWkU8LflB3kFaSxP4n19NeqozFro4qbqZepLadrhnS3sWgqy2ZjDG4Oa7ziR2qbURxQtiYxoa1rtgo3VsjyGgAOdqx3LTjcd4o/t6VFUM6HFu6SYThTQBhE5oXWkNoghmHcuRH2rXPb2rNvbsStW5uWD1BWJESib8ifz3fan9JQoW/JPHdI77U+GIGMaUWkp/QhoQAxp8ENCf0eKGnZCAY0oaU/o8UNHihgMaUC1PFpQ0oEMFp7kenwT2lDSmBH0IaU/pRad0CGC1DSn9PihpTqwGNPghpT+lAs2QMY0+CGE7oQ0oAZx4IFie0puokbDG5784a0uOExDM7M08oxzYfsSKEZoKc/6Jv2KRE9s9O+RnIgj6km2Nzbqb/VhAgaENPgU1cKp1MwFrASXhu/ipUB6yCOTGC9odhADWhAsTxG6BagCPoQ0HuT+lDSgEMaUNH/nCe0o9KBjBai0p8s3Q0IEMaUNKfLEWlADOlDSntKLTlAhjQgWJ/QgWIQEfShpT+hDSmMY0oaU9pQ0oEM6VU8Vt00NK/6FbEfrV5pVRxmz/EL349CaJ39YIAsSzDj6ygWp7GclFpQAzpQ0p7Qho8UwGdKSWbp8tRaUhjGj/wA4Q0J/Shp2QI58KfHalCm8VM6sBGGBcVHSRBTg/OR+TDscpYYErQO5OgIYph3/AFJQph3qYGJQYEqGQxSg9qcbRjvUprfBOhiVDIYox9JDyUd6nafBEW8kNAQxSt+kjFKO9S9IKMMCVARRSj6X1IxTeIUsMCUGhCQyJ5J4hKFGe8KWGpQbsm0KyIKPxRij8QpgalBu6VFWQvIs/OCHkB7wp+lDSigK/wAgPeEfkB7wp+lHp8EhFd5Ae8IeQHvCsQ05Q0lNAV/kDu8JJoXj5wVlpwie3bKBlcKRzXAkgjOFIMDO5L0kkesJ0jzk0Jkc07McknqG9ylYRaU9i0RhA3xTgp9uaeazJTzGZOMJi0RW0++MqbTUw0EP3GU7FCBud1Ia3CuKJ0FhG0ZKXgJQG6oGwg1KwnGtRhvgqogqr0MMi9ZRWioYYnRuOlzXe9O35vycfrKYs7BiZxaOQWWR0aR2PVTmuZOAQQ5uPqKwcwDXNONgcexb18Yd1jcYzt9SxFUwa5Getedzv8Uzs4vozG0afzXlp9yk2WHNc0uwdJJTLWjTIe/DvcrOzxN6x7/nDZcHHVzSOnK6Vmka5jnc+SkxuZo5hQY2NJKkMa0R7L6NaR5H2ColaBzWf4ucJLK7flM1WtSG5AHPG6qOJWf4jkI/lmhZZX+rNMa/ZGPaMPzjklQjFP4vcjeCI3EDfkhnErYwNmt5+K8KTo9QkU7dY0gbk4CwHSG9zb/Mxz3PLiNQdtgBdJtDA6qiaRt1gCgdNVjp32+jukULWzCfq5HNG5bgn9i9DhL7OPP7RRcFU+ix6sby1D3ke5XzaKN79UjQQVB4TA+I6UAci7PrytAXs0BuNz2rqybZriTSK51DE07AYRspYm8mgD1KU9u+cpiZzgCGFZ2dMY2VVewYc0JNipesrGY5MOoqTPHsXE79qesxbFRzzZ85/mx47R2px2y2mFMNUriO84UOeIsk0kbcwrDQSAcEAJFyaXU8UsbMlgw/HaEqRo1SIsLBq3U+nOh2cZUWjb1rdbd91LI0tJ7QpuhdbJgkyMpJI9qbgdnYhSRGxyGzNwoaaxuTsjI8/DWnGMp5zQ0YCb1dh5JL0XUPswuR8e0UkV6kYwFxMmdvHddcOnOyyt4pGVXFrGvaMNiDjt2nZbY5U7OXLDto5pQW2rqnlsMZcR4bLVWXhmds8JqmgE7gd/gtxaaGigmMdLHHppyQ9uNyT3p2oYG1sDiA1uvCrJn/AKNMHEV7Nzwa6J/DtMGMZGYxoc1owMhW/m55hU/R2yB9mlM4H775ufUVpTHQBpPVtOF0Y9xs87lRUMrSIYAPajwO9JeWlxLWADuCl6KV0WoYDsKqOeyNgY5hG0DHMIGNnYAiEbe5IqwEAdoREDHMJXVt7kks3SYiLVt6sidh3Z6Q+k1V85pXMfSPLOqm8+F2NmuznH7VZzx5GFnbjD5PI6KRp6t+7COwrOdIdE2JlsqWydZRwtl09XM0MAz94PNZe9cJ0Zgmfb6h7HBhLIzuM9yer650DXVWtrJ4G+dqOGys7vWq+q4ytbGtMXWyycy1reSyv7LjjcvDYWSSntlBS0sbx5I5jerOfRcRuD4EqdBUxsqq+YvaBE4Z8NLMrl0XFZbBJTNoi+FzjoDnbhp7PYpFruVS+iq4NbyarVlzubQW6fsTWVeGq4eVrw3dG1jhTxStZIH0AL2uGQcuyftWA6Q+EoLcz4zt5ApXyBskX8m48seCmz8Ty26pjkkayRscAh0jbkRv9ShXvjajudqkon0UjXOIPeNspNxkqInxMi9RbdEQp6KGKSaYtFTFLMGk7Za7SCPEgLUcV2S33ez1dzroiJ2U7nQuGzmNaCQCsHwtc6V9xt9LBEH01G9ga0kBz/MwefiSVveIL7BPbnwNpqoMkcxhzEQHguwWgqYSVUZvFKC2ZfgjiFsNstlqwY6qlZKJtYxo1EYd9a2VuqKWWmdLBOyQFxBwdwB3qj/Bts1yqK2lgc0PgAdI8Y1OzkADuA7VR2SWWh4sgoJQQ2oLo3t9hIP1KfmcWk0Q0bCtkDnt0nIDgmZDl2yqeIeI6S1PfTvpZXTYyzHouPrWXbxzWsnDqiiidFndrNiB4LplNDUkjoQcANyhqCqKS609dDHU0j9UUjcjPMeB8VPik1BXHZPax5/oO9S14b8k380fYshzYfUtqxuYGH8gfYrGiLQAaJNv4xykafBJt7PNm/1rlJ0oGMafBDR4J/ShpQBHLMIaVI0oaQkBH0IaE/pQ0poCPjCLSpBYETmosBjShpT+nbki0osQzpRaE+WJOlMQ0WotKe0oBvgmgGdKGlPafBANTAZ0+CRhSdCIs8EDGQ3bkoN5AFHJkgZY4fUrMt2VJxHTSVPUMbIWMZqc8DtAHJAiRZW5oHD8v/6QnLQB8WU57mY+tFw751CRjfU3+yEdjybRFnmC4f1ikFEC/ujBjiLhrfIwhvt5qyoRmig/MCp75StdWPrnDeJrGt9rhlXlsGbfF6iPrKEAvT4JJbuntKGlAqGNKGhP6N0NPgmNDGhDSni1DSiiRnQiLcJ/ShpRQDGlDSntKGkIGMafBDT4J3T4I9CAGdPggW+Cd0oaU0AzoRaU/pRaUCoZ0oafBPafBDSgGM6VWcU07qixVETRudJ9zgVc6fBMV0PW0kjPpDCQFC271YbjyVvtKMXirzjyVn6Smw20Euz2EfYEv4tHcFOy1RXOu9Z2U0Y9qbdeK7P8Hj96tRbGduEDbIvBGw0VRvFaf82Z70k3e4Z2hjHtVr8VszyCHxXGOYCNhSKr43rwN4Ij7UTrxX4wII1bfFcfcEPiyP6IT2LRmSxANT5ZlFowVzUbjYb4IwPBPBoQ0hADMjooxmR7W55ZOE0Kyj1aRUxk92pRb5SROqIpTgucMEHwTdDbqGSphDgxuXDJI5JDJ7K2Akhj2uPgU62qbjJHNR5bfbxUSOgkbGBnBGcHdR3wOeNMc2SNm4QxFm2pYRvsltc152VPTdaI8SEl2SFb0ER0B7u1JjHdKACd0oYSASAhjdOBqMN3TASMJQAStKPT4IAJoSgN0bWpYbukMLCJ2loy5wA7yUvHgqu+0fXPgkLjpGQ4ZQBLfV0rDh1RHnu1JHlsJJDHhxVZBbKCaVrJtABB3x29imPoKEyOmhc2JwwcE8z2ophY/wCWN7kbauMnBVVUU7ySY5iXk8gdikQdY5ozz7UBZftw8Zaco3N2CTb2fuYHtT8jUikR2M1SNaOZKlGmOooqNuayMflK2LN+S1xxszm6KryVDyY96tNDUBG1adDPsVrKU55ZUhlOG9hUwNCPSE+qDsRhGj6vwUoNCPSE6FZGazwS2xnKf0juSsBKh2NhpwjDU5gIYCAKm/t+Tj9ZTVmHyU3qCk38fJR+tM2cYhm9QWWU2gKDflD4u/YsRX+bWvPfn7VuH5bqcTyJP1LJ36nEdY0NGA+Njx/SGV5/NTeOzo4zqRWNyHBjvntI9qubI0OjL+RwNlVVDSKUvHNh1K74fx8ozsIDm+r/AMlcHC/+ojq5H+BcRMAc8BPBuI0mIDLvWny35NfQvSPIT2V07RqVXxGD8TPH+larmZu6qeI2/wCKHf61qwyf4s2h/kjIyRuDYnY817jv+bzTUDdQLiObsq7rImfgxSSgec2pmjJ9YaVWwsxCR4LxckadnpRdk2xN/dcJP8qCrLpQh18LZwSGTtJ8NiFW209W+Jw7HD7VseJKI1/D1bSsaC+SEuZ+cNx9i9DgO7Ry53U0zlXDL8WdjG/Mkdz7jgq5YS5oOeSorKdEEkOfObod9WFdwkOaFvP064VY8cnATMrSBkKSAMJDmgrOzoiiBVDEI1HAJwoVLcqd8/kwLWluwHgpt0a2WLQDhZavpYjpdLJ1Tw8Fr2nByFUb+ipKjYSVkLYCwkcuaqoeILaanySOoD5RzDRnHrUCGkNTA9r53OY4YzlR6CGz0kkrqfR1xw1xJ32TqibvRpqJ0UdY4Q46uVuvA7Cpr4g8ghVFrDuuMr8AAYA8FcRv88DGQVDNVGhLGFpynWA685PqTpYDy5JOO5JktWFI4gpvnkpUhyU08OzgHmkmTJBl+RkbKBbo4qi+1kjxqboYzPt3Umoe2GB2p2NlA4SDQyrkJIIILiTyABWsTjl/kWNPSiKQS6gHhxjk8cHYp28NaaTWOYIx68pgGSppmzxRSO6whziBspUEDquppaEguBeHyY5gBZvbO5NRVmz4RpTT2GIkEGU6xnu5D9qttCe6sNa1rBpaAA0dw7kNK9DHqJ89yZ98jkMFmyMM2T2jZDRsrMRgtA7UABnZQ73Uz0lHJNTwdfI0bMzj1rJ/hBeZY3PaIoQ0bgDKiU4x9NIQcvDdNA70osBWCderwyFsjp8ahkeYl2XjG5y3anoJKeOoErw04Glw8VCzRbL+CSNwWeCrrpRsmgc12dtx4K6dHumpYgWlU1Zmcb40slXI+OqnqNdHE0gx8vPJ2J71lzG1jsNGAOS6xx5EGcO12ASWNEgAG5w4LkrnSl+GsA9a58qpHq/j2mSIR523NWYM0dPrY1xx3Knj61rgS/T6grW3yZd51VJjwwFys9hv9dFRUTddIS9+o9oKbhJjkDgG7eCVdQx9xJbIXNzzITTmTR+f6Te9TJtHzHMWeMtvRdv8intfWtjZFUsO2kYPgtlaLq+z2yyHyx1XSXR8bGsfzhna8F2PBc2jkc4AAhpJAyeQ8V1XiThmhbBwVQUk/VyOrmhj2nLX4brccesK8L+zHFllPTOhVBYx7mv86Q580c1krzYxNeaO5Oa2IQB5c4HcYBwSfbhbCfqKRjpX5LnH1vefBVslNPVu62tAYwbspxyHi49pXRJWX1OecT2v4xpZHsaWBrcU4PMuJ3cfXyXPGxB+tj8tewkOB7COa7ZeafTG5wHIgjw3WG454YqYa2a8UDDJBKdU0bRux3afEFTKLoxyRsXwZS9Vw3STfyskh/rbLTUrCW8lC4aow3hK1Rs38wn3klXkFOWMG31LqxvRMY0IYzzD6ltom5pozj5jfsWR0YaduxbWmb+44T/om/YtUUR6JvnTj/SlSNCTRM+Vn/1n7FJ0oGMFgRaVI0BEWJAMaPFDR4p/QhoQMY0eKGjxT+hDQmIY0JLmeCkaURagBjRsi0J/TshoQAw5myToUktCTpCYmMaUWjtUjQiLQgQxpRBqf0BDQFQxnSiLU/oCGkIBkct2UKujzE7b5rh9StC3bkodYz5P15CBMhcLDNE4+LD/AFUqxNzbHA/NmlH9co+EBmikB7mfYQnLEzFFOO6pl/tJMCFfo/8AF82B2A+4hT7W3/F7PBzvtTF+Z/iyq8IifsUuytzbh4Pd9qAHAwoaU/pRaUAM6UMJ7SENKZNjBahpT+lAtCAsj6UNKfLEWnwTGM6UNCd0dqGEqAa0IFidwhpRQhjQhoT+hDQgBjQhoT+hDSgLI5aiLU+5m6LQmDGdKTM35MqRoSJW/JlJCI8TPT27QfqS9B7kuMaSc8iBj60oluOf1KgGtKGE5lveiJBPNADZahjwVJfOMOG7NMIa+5xNl7WM84j14VY7pN4OG/xi79UUJDNboQ0LHP6UeDm8q2Z3qgKak6VuDwNqmpPqgKYD/VORdS4qz6juRiBxzgLko3bKxsLspfUuB5KwEODujMe+UOIJlCYGGocZnM6xzsNDjvjwCDGNie6WOSEFhxzGx7lm+M5qmju09RAHRhrMPmLdQaT6IA7O9Cz2/wAifHcK2rNSyWdnUahhkpySclTVF+mjbM6J0kRFM9zQC5rjvg9yafBoc1zWAA9o5LC3R0sHF0zqY+WTFoLWNOwAGSU/PdLvRySStqB5ESBEM6mhx3cAn6PozdMp8RBxHpE4UumY4CNuOw596rrJUVU/D9HLV460ueeWMjbBVtbTrmwe5HUhuhzR4IaD3KeIDzRmApdWPsQNBPII2sPcp3UFGIcJdWO0QtBCMMd3KcISjEBzlHVoLIYjKUGHxUwQd6V1ICTTCyEGnKz94rnsqZYYWtfOwgaXcsc/sWuMTe0rD3qSFl7q6eonEUZla5ryNthyyssrcY2bYYqcqHqG6SSwzTRwCCTU5jWvHmv7se1OQ3Co3pzTxSZHyjsei7tAVTVtmnoaqqdVdbFRPjlYIxjW3VupdDLFbqIzXAvjrK+YmNoGQC7kPYuFcuaZ1y4sWrJ0/wAlI10jQzUBpx3pUQxGS5uHE9qzl0uM3X1NsupMcjI2ywvYeZz2K9slS+utsc8jHtJJBD+ex7V14s/yOjmy4PjVlxa9RYR2KXK3CFmi1NdtyU8UhmcRGQT3LejCyBRN/dke3arsUszxqYwuHgosNumimZLI0BodhWMUskEhLdx2jsXRiVIxmyOaOp/knJBp6gc4n+5WXl8n0GoeXydrGrWkZ2ytEUo5xuHsQ0P+irCWrdI3S6Nqa1Z+bhKgTIoY7PJK0OT+DlKARQyOGu7kel3cn8IYKQ7Ggw9qMMTmCjA2QFlLxBs2IHxKZsxBZN7FJ4iA0x57ioVqdpim9YXPl0zfHtDlxdopJ3esD3LO8QjXLROadzRRH2gFXV5lHkB/Les/O50zote/VxiMeoLzuZlSi4nVgjtMjSx/IlpGzhup1gfiohacglug+sJiZmdA3329qOlcYbhAfy2n615nHn1mmdmVXE1cbcOdn6SkkHq+SRo3fj6RToB6sAr6e7R43jIE45qo4jbmzP8A9az7Vd1IGshU3Eg/xPgfyzVz5H+rNsa/ZFBPODYG0vzvLHyD1FoCjNZmMYCN7cvawDZu6kMZ5vLsXh5Z9mejGNIREMRtx9ILoNJ51NBJ+QCsCMCNng5byyHrbTTv/Iwu/wDHy/ajl5Uf1s5ZxRbzaOK6iFgDYqgF0Y7MHce45CVSHzButh0n28SWuK5hnn0pwT4Hcf8AnxWMhIDRg5zuu3NHqzTjZOyJwOyRMPNJPZuiidq9QVXe6twmEMby3Ay7C516ejFpKxm7VrI43BoJkdyA7FjpvKJqsFx0tecDPerh0T6p+lsji7m4nsT0dNSUpb1rtT27tGdgto6MpylkeimndLT0cdKJn+fOGkt28VEmZIawv0nZ223YtOyWyudl9Nl7TkYdtlORS2p8z3iINcRtvnCtDWGaIdkugjcyCbOHE+d3LUUVdFIwuDht2E7rM1FobJTvlhkJcHDcHsTQjmp3NLnEAnc96zlEpTktM6FC4PZqHckSggrN8O3PTXClkJc1zMg9xC00hyPArKWi1saOCdim5Nsd6U7zclNTSgY3GrBwFMfSZ6Km9TadTWkOI3I7k7wcHeSyl7QSZCHjsIwqy4z9ZPM9rcnVhx8Mclc8HVNK5stJJI1s+BIBnmOWV0pfqca3kNE6E+QOZTARjGwHgrPha2mlYyql83V5zc8/DKiWyUzStgYBhrs68clYV0jzRtcwvmDHNjaRs0tLhk+wbLjnyI4WrNczk04o1UfntDj2hGW79iatcbvi+DSCQG4Bz4lS+okPYvVxS7xTR4k006GtJxyRPBDU/wBU8DkUJWhrcEbrQkq6toMTg4Z1gt9hWVrOHKwxk0tY2JxPLRtpWqr5SwhoGDzTdPM6RxbKwDBwCO1ROCl6VGbj4Z24WC4TdT1FaxjRE1rg4avO7U/ZbDLS1DKmeSOaojOY3BmFpppYnEEYG2EiKRjSc4ws/iijT5ZUSaeTroBIRg5II7ig71Ju2StNNIRj9+eEc1RG3ORutLM6bZnOJQGOa5wBa4EEEbELk10hay4TNY0BoecBdX4lmZPG0NxkLl9+b1dylDju7dYZXcT0OC+s6IRg1NPeo9RqhbgAhToiMDAKmUdLTVbzHU5DSOeFwqR7PIwynjfV7M04ZOSOacgldHsW6geYKeraR1NVOjY4ysB2cG9iJrRgAggeIUSdny0nnxT/AGVm96OuHrJc6aSpqqeOY9aGYc7sx3K64loZD0hcJ8PUbzCyjEtTE8nIa0DYY79iFL6N7BBQ8NR1EwD315E5J+YOQA9ilyUsVLxPQcRS1b8fGhoDHIQdLTG5rd/Xv7V0w0jZ73VGsp6QNeZZXGaZ3N7uzwHck1ER3PgrEswSMck1M0aTstoiMleGfISZHZ+1EW+YdtjzUq/sAop39w/aklg04wraElZGpKaOKEMYwNa0nSB2J10Y7ApDWYbyROaqiTJIiOjGk7di2NG3NvgOOcTfsWVe3YjwWvoG/wCLKb/VN+xbEUNUTflZ/wA/9gUjR4JNG35aoH5Q+wKTpQIY0eCBZ4J7SUNJQMY0eCPqwntBQ0FAxjR6kNPgn9BQ0lAEYs35IaPBPlpzyRFqBMZLEnT4J8tKLSmIY0eCIs8FJDEksPcmIYLEWgp/QUNBTEMaPBEWKRoKLQUwGQzZAs8E9pKGkoAj6fBRqpnmYx2qxLVVcQVYoLeajqnyODgA1vaSkDInCY/c0mPot+1yesrfMrW91XJ9oSOEhiORhGD1bffrcpVob8vc291W762hDAi3uPNvqR3wuTvDoJtu/wBLPvAUTip9Y2KKCja09cS2QnsbjdTeFvOthB3xpP8AVCAJujwQ0eCf0oaT3JgMaPBDT4J/SiLUCYzpRFqf0oaUCGNPgi0KRpRaSgBgsRaPBP6ShpQAxo8ERb4KQWpJaUWMZDUNKe0FDQUwGdJ7kWgp/QURakIYLN0WnwT+lEWoBjBae5JkYerd6lI0onsOhw8CnYiE5rjjS0nA3RaJMfvRUiEecfUE7hMbK8sk7Ij7025s2+IyDg438FZPCba35QIEeTL7q8pkc8HWZZMk8ydSrMq+4thMdxqozzbVyt/rFUThhUNBZKLfvRoAIHo9P+VxdzkBVxjkHKJo7x9SPTg8l4/8yR1/CiT5Uz6JQFQw9hUbQO5Ka0JPlyH8SM5xLZK25Vz5IpmCAhjurLsZc12d/DCq7twzxDXtNMKumjoTUCZtOHbR+AW40pYaO9T/ACWaRhRi6bhe4w9aYmUkL3RsY17XZO3PPrTNfwdc5YOogmpmsL9bh2E5zy7lu9G/NANU/wAhlFVR0FRHSxxSBmWZGG8uz7lKpYpIpdW2B4qYGo9HrV/y3Rk8aZIiqWBoDspw1MSh6Aj0I/mP+hfCiWKiLxShPFjmfcoYZ4ow0J/zH/QfCS+vi70YqI+9RNGe9GGI/mP+g+EmCoi7XInzM7Co2hHo7Mo/mP8AoPhQt0oI5lZW9WmvqL8KiGGGSnM4ky87gaQDt61p9CGlZZOQ8ipmuKPSVooYbVVxXipmzC6jniDDGG4wQ7IKZkorpUQFtTSU8szXF0bnHYEE6cdxwtLpRhhK5eqOn5WY6WyVtTb431tKyata8jJdybzG6sbFQ10NvZHVtAmBcTv47K/MfggY1tjydHZnkl8kaI0RfAw9mUqluE0NSC15Dh2pyVnmDbtUZ8bSeWCuzHyL9OOWOi8pLhU1c7IpZNTc55dynObuqrh6GR1SZNtDBj2lXZZ5y7oTUkYSVDGhAsUjShpVkkcNS9I7k7pCGkJgNad0oNSsb48EeEAN4QwnQ3Pdsj0+pKgGgE1POyHS14OXcsKSQq+6j5SPt2Kzyy6RtFRVsgXoeWdWIubRvlQIKWoYHglozhHxJWy2q2x17WgwxVMflII5RE4cfZkH2KdCCdQG4DjgjtC8yfJcjrjCtFdX0VRPTxRtkaNLiXZUIWipznrI1oNO+4RmPPYVy5V8jtm8ZOOjPzWqpLPNMeQQRkpqotFU6VsjHMGCDzV+xwfr05Ia7ST4hHhYrArNPlbFxyNaHagck5RPmBbgBNlqSQR3r0VyWlRxvGm7EVJfLK54wAVXXeknqqFsEZGRMHHPdhWeD3IsO71EszkqLjGnZmhZaoOySz3p1lpqGtI8zJ8VoA09qBGexcbwxZu8zM8bPU9WGgsyHZ5rSWGRtHaWUs272uJ27kjSi0rbCvilaMsku6pjPF5dX8PVdJTRGSRzMtby1Edi5bZJ+soIRIC2Vo0PaebXDYgrrAbgZXJuKAbRxrXwlumGZwnbjlhwzke3K7PleR7Fg/V0WQdoY7G5AWalPlFRMdeXF2MDw7Fe01SyVgOQcjIVDSRgXOoOQT1hIHqUrTPRcrjQZnjoKQtd++uO57lS1dQ3y1rZ4ZJGFpJx2nsWlqKGOaMksBdzTBo4piI5Yjk7ZAWsJq9m2KGqI8tdYTRNLaGV0oA80Nx6903X1tHUQx+TWowlvaeZVjFZogSPNLR4KWy2sawNijGSfSK07o0+B+uRm6F9dA/OdOdwD2q5gEtTFmemDW/UrintrMhzw1xHeE++FjQfDsWE8i+hSgvDLT0pY8GF3VvZu0nu5rW0ErpqNkr+0b+tUFbSsbUs8/DSHAg8lPFS2ChELOeMBZOXZGCfVkl9RqcNyBuCq2trTqDeR1eaR9YUE1Z+VGsjWRvnntv9aiSynVpLvNGp7T3HmFpCBnkmFK8xx1OsbSEEeKVw/aai88fR0kYLRR0jJpQx2kuGQA3Pjn6kxrdcJo6SMZc4gDA5ZXRejizmi4vvdwlI/dEbGQtxv1bNifetpOonFKVO0a1tGI6kxx0wZAQMacZB8e9RaijrpXSQvizTujLWFhAc1XhaR3JWknfAXjPjqUuzZfzOiVYqt1JaaenniY+VjMOPipbro0HanYqrRuj0br1MfKcI0kcksSbssxcwecDExPWCR20Yb6lF0Y7MI9JCr+Y/6J+EanGt5doByMbqtqYa9rSIKfrP6YCuNPgjDSpfLZawpGbmZfDH8nbhqHYZgob/AMK9R02iDTnbFQMrYhhwgGnmVP8AKZSxorLBFWQ2oMrYxHO6Vz3NBzjKOtgqXsPVM1E8t8KzLUYCP5TF8aMXX2a9vjlkhgje/SdDHSYGVj5+DON6yoM1TT0jXHsbINguzAJQHgspchtUdGJ9HaOOw8C8Ut3fBCfASKwpuEeI4hvSN/TC6q0FLaFl3O9c+S+jk1RwxxI7ZlvYfW8KFLwXxhJvHbKf2yBdrjZvyT7G4CzcgfMv2KObcE2bjijr6aC6GM2tgILNYJYOwBaLiO0wS9RSysDaeovUD2jPaWO3/SC1jW7LN8cUjJamyTzydXTNuMbJSCQ4cyCCPELWGZvRwZv3dmjoHmeggmd6TmDVnvGx+sIqhvmlTYKeOGnZHG3DGjDcHOyanZkEYXfFnKZHiQabVWHujJRxN1AeKVxQALRXD/ROS6RoMbfUPsWsvCVoMsTbmqYWZSCxOJLIhYT2di11sbm103+qb9izYZnkFqLU3/FVP+YAtkSIpm4nqPW37FJ0poiSGd7mxh7Xgcj4JXXS/wAgT7Um6FQotHcUNKb66b8WPvR9fN+Ln3o7Dpi9KGlI66X8XP6SHXy/i/8AWR2ChelDSk9dKR/B/rSTNPj+D/1kuwUxzQiMaR18o5wf1kl1RN2QA/0k00HUWWbIgxNGpqOymb+kmzU1X4s39NOxUyTpSS1MeV1P4qP0kh1XV5/gjf0k7DqStCGhRPLKr8Vb+kidXVWNqVv6aLFRLLUNKgurqv8AFWfpovLqr8VZ+mjsKifpRaVB8vqj/m0f6aAra08qWMf00KQUTi1Q6qlFSWMIyA8Ox6kXldbj+DRZ/PSPK6xpz5NF+mix0NWS3T0c0zp9OlwIbg8/OLh9qVa24r7qO+oB97AjNyrORpYv01X0VfXQVlbLLbwRM9pbpeOQGEWFFw6lZO/L+wED2pNsoG0EBibI5+cZJ8BhQxeKhoP+LX7/AJYQ+Oan+bXfphFiLYNR6VUC81X82u/WBEbzV9lt/wDECdgXGlEWKmN6rv5tH6aIXyv/AJtb+mnYqLrR4IizvVKb5X5/ycz9agb3cP5uj/WI0FF1oRaPBUhvdf8AzbH+tQF9uH82x/rUWOi6LfBAMKozfLj2W6IeuVJ+PLmeVDT/AKxFiovizvRaFn3Xu6/ilN+miN7uv4pS+16dhRodCGlZz48uo50lIfVKUk366filKP8AvSkTRpdCSWLN/H90/F6T9YUl1/up/iaMet5TCjSlvgi057FmHX67Z5UOPzyi+Pbr/wBR/TKB0ajQg5p0nbsWX+PLsfn28DxcpNBc7jPVxRSVFJpeTnq9yABlFiot4WjJ/NCc0IRNGvH5PNPaEwIz2pDG/KAhSXMTYbh4VCPLnSJD1PEN1jG2iuf9ZKyZK3XS7H1XFt8ZjGKgPH1LCJoaDz4IIkMFAzq3x1dfx6RKF7uv47J9Sb+K6jlqYlR2ucuwS1eL0R6PZC/ju69la/3BGL3ds/w1/wCiEPimYHZ7UfxVP9NqPjQdhQvl3x/DHe4JXx5dvxo/ohJ+KpsfvjUYtNRgYe0qfjDsLF8u3M1R9wShfLt+NH3BIbaqn6TPelC1VPYWe9HxBaHW327fjP8AVCUb7d+ypH6Kbbaar6TEsWmq/J96PiQrAL9dj/nAH9FKF8u3bUZ/ooC01P5PvShaarPzPeh40FgF7uv4wP0Qli+3Yfxzf0AiFpqvyPegbTV/Rafal0HYtt+un8s39FKF8un8u39AJAtNX9BvvSm2qs+g33oWMOwsX26D+Ob+gEYvtzz+/M/QSPiqr+gPeg211hdjqh70fGFjzb9cx/GM/QR/H9y7Xx/opv4pq/ot/SQ+Kaz6Df0kvjDsOi/XH6cf6KMX+498f6CZ+Kaz6Df0kYtNbj0G/pI6B2Hxf7jn0o/0Efx/X/Sj/RUf4prf5NvvQNrrR/F59qax/wCgslx36r1AyBjm9wCtKS5UdUMB4jk+i84z6lQC1Vx/i8e1EbTX/wAn/WT6C0dC4fcGwyb/AMaPsVu3ffCwnBjbjTXUU1Q9xp5GlwBOdLgFtqPU+P02D1rt491s5svo8cJOyX1Tz89iIwv+kxdRiJQR9S/6TEOrl+kz60WAnbUUoI2xSE5Jaj6tw5YRYDTmEu1xu0ydueTvWjima95jcOrmaMlhPMd47wnCx2eQTVVSmoYASWSN3ZI30mHw+5AEStrPi+sY6pePI6hwa2Q/xTzyB8D2HvRXmjNXAQyd8EzR5j2/YQie8yarbd4Y3GYFoJHyc48O4+CoHVtZw5VxW+6SOltcj9NLWu5xHsjlP1AqJ01TGnTMZxlPdW0tdaqyokAfE4FudnDCg8N326vstOfL5Thmg57C3ZXHShFLLcesifgxQnPc4FZPhDXNRzUsTHPdG8vIaM4B/wD4LzMsEpaOiMzRS3y6gZFdKodXxFd42BkdfJ1r9mDx7/Yo1XHNFu+KRoHaW7KPSwSSyyTmJ50t2OnZo7SocV4bOf8ARbUl2uNPA2JlbLgb79pO5KeF7unZWSKqo2yVEPWMp5dB5HTzCe6uYDeCT9FLqUmixF6uhH8MkQN4uf429QWRzEbQyfolH1U+d4pP0SjoDaJhvN0/G3ofHd0/HH+4KEWSdsT/ANEoi14/i3/oo6honfHd0/HH+4InXu6H/PHewBQXea3Lg4exJw9wyGOI9SOoUTvju6fjjvcEXx3c/wAcd+iFAIf/ACb/AHJDtY/in+5PqDos/ju6fjjv0Qsnx9LUVJguM0jnvYOpc7HZnZXAL/5N3uTNbTmtpZKV0LnCRuCMKoaYeGboa7qJh55LQ3AHce1SqaSJtcJG7MLCOfM96ocSUdRLTVbNEkTtJB9WxRdbKz0TgtznJ5cl0OFmsclG4pZBIBq3ynywt3aFnuH7kZ3ubIRpaPSV+KlmgHXsVzTTiz0MMlJFTdblLTPcwBwJIAx61aWKV9Vjc4A3yVW3MQ1Mm2dvOd6h+1SrFUMpaZj3jR1p5Z5BWv8AEu2maLGkKJVPGhxzySK24Njh6zbT6+aoa+56qUlztQc0jAGMOWKi5McpJDV0qS5mrbHekPr2SUrHB2JGg5zyKp+vfIZMyg+bkZKOja19NM0tw/I2J5hdMcejgnlV6JjptYEgacElzjjk4Aj9qhTPI8w7ADcZRvlbGySPUWtwNieSiQmSpqhE0jU4haxjRhOdmp4ApHVF5dV4xHCAPWSthFcrjHfK+qB6prCKaAc8xtOSfa4pjg2gNDa2iQjrSAXYHapF2Dm3CUtjdpODsPBZZJfQnHVkz4/uvIVI/RCWL/dfxgfohVA1bnq3/opxmrl1cmfzSufqKkWzL7c/xgfoBOsvly5Gdv6Cq4mPIx1Un6BT7Iz2xyD+gUUFFiL3csZ65n6CcivNwfzmaP6KrhG7HoP/AESn4Yjj0XfolHUKLJl1reRlH6KebdKs7dY39FV7I9uTvcU7HFn5rvcjqgosGXGpPOQe5SGVsp9KT6lXxxZOMO9ykMh25O9yOoUTmVRPzk62cn54UNkJ7nD2KRFD2F31J9R6FPncPRdug2rkA3cqq5VAgrOqMgHrT1E2Spe0MnYG88k9ilxDSH7pfaW104mrKnRqOljW4LnHwCzNT0gvpLhD1rXGicflS0DW0d6yt+PxreKmocXPa1xjh32awHAx6+aq6q1jRjLiBs4k9vcs5qjiycpKVI9G26a31cDJ6SuhqI3tDmuDwcghSHRHPmDK4v0Juqqfi1lrjb1lJUxPMjHDIaWjIcO7uXb32uMco3N/NJCfVNWb4svdFfK+eNxDmFN18bZ5rL1rWubJW8iMg4jelV9ml6iWUVtVHpaSAHZ+1Qr5SV9LQWW4TV7fJ6GshkkOjDi1x0EHsx5yqEVZcmXVlB8lmgOS2nnfCwn6Ixj7cJ2oZtlO2KLNsbMR51Q98x/pOOPqwnKmPzSuxGJhuLf8jV/+pcn7cNdNG7va0/UmuMWkWi4d3UP+xSLMM0cPcY2n6grESXM2TZZ4KWWZCQY1SJZHDFp7MzVbKYY+b+1Z8twVqrGzNspvzf2lbIhnFOMukm60F0qqGlnjjEM74yerBOxwsy7pSv7cf4wPh5gWN6Q6t0fG98iccabhMP6yY4ajllp7rcmDLaKje5hwDiQjbb1K+orNx/hW4g/Hx+rCS7pU4h5/GA/VhcsHEdxLQXyv9sTfuShxBUkAmdgPjE37k+lDtnTz0qcRfzj/AOGEP8KnEQ3NwHtYFzFt8qzyqYv1TfuS/jqtPKoj/VNR1FbOmf4VuIey4t/VhF/hW4i/nEfqwuam812P4Qz2Rt+5F8d1v4239W37kfGhqTOmf4VOJD/n7f1QRHpR4j/nAfqwuT1l9urZcR1pDPBo+5SxerhjerBPi0I+NC7M6X/hQ4kP/vBv6sIv8J/Ef4+39WFzN15rxzrB+gEh18rRzq/6rfuT6ILOnf4TuIz/AO8G/qwiPSbxH/ODf1YXLTf60f5yT/RH3JJ4grT/AJw79EfcjogtnU/8JnEX84N/VhJPSTxF+Pj9WFyw8Q145TO/RH3IvwiuXZO4f0R9yfUVnVP8JPEJ/wDeA/VhEekfiE8rgP1YXK/wjun4w79AJJ4iu+MCpd+iB+xPoKzrVPx9xHI/IuJ/VhSz0gXuNuH3HJ/MC42OIb5jAq5B7Ah8c353+eye1o+5T0Gdef0k3wbC4f1AmZOkq+nYXDfwYFytl2u5BFRWPfD89uACR7lYNrrWI2F9FVlxaDkTBHVBbNzL0hcQPJ/xm8HwaAm28e3/AJfGcpJ5eaFiTcbKTvQ1m3+nCi1V6tnVPjo6OrhqSQGSGYEN37lXRCtnQ38acTuG9XVfqv8Agm/wz4m/Har9X/wXODcLxn/KtZ6usSXXG7g/5WrP1pR1QHSPwu4k5+XVv6H/AARfhZxMf89rv1f/AAXNvLrr/Otb+tKLyy5nndK39cUqQbOkO4q4mI/htd+h/wAEgcUcS/jtf+iVzk1Vyx/lOt/XFEKu5DcXOs/WlFINnSPwl4kP+d159hQ/CTiQ/wCdXD2ArmxrLjne6Vv64oeV1553KsP/AHpTpBs6QeIeIjzqrj9aL4/4gI/hNw+tc1dVVnbXVZ9czvvSDVVX45U/rnfejqgOkyXniB/Oa4H2lMuul8/lq4f0yudeU1JO9XUfrXfekS1MwP8ACaj9a770+oHRTcr2/nJWu/plF5fee+tx4vK5uKmd3+cT/rXfegZ5uRnmP/eO+9HQDpIuF3zuar9YfvShX3PtNT+sP3rmYmlHKaYf94fvSXTz/wAtL+mfvR0BHTxW3LvqP0/+KUKyvJ84zY8X/wDFcs62X+Wl/TP3ojJJn99k/TKOojrUU9QfSc/2v/4pzrZu8+vX/wAVyJsso/jZP0ylRySF4+UefW4pOAzrjXSv9In2v/4rX9Fz4YuLabraiJmpj2DVKPOcRgAb81wCM6gcggjnurXhNwg4otMrNi2uhP8A4jUurA9oxsIlII7E6W7JxzcVbs97vtSnNTJIzmpojzlLI2TLm7pok859OdOIeLbi7G8sTXfUFzMc911v4QDf/WgNI2dRk/WuSjcBUhhHmhujwgmB21saca0hPacdmUNO/JeZR1jQb4JQanQ0BLDQigsZDT3FKA8E8GjHII9OydBY2B4JYHglBuyWxoQOwoWku5bJTTuU9C0ZCRhrGl7yGt7yVFMADlyRhNw1Mckwj0vaHgljjyfjnhPtPnDbIQ0Fgb6koeKWBnkjDd0dQsSD60beaUGpbW9qdCsACVpHclNHgnA09yVDsaDfBKDQl6fBHpQ0OxvSjwUvShp8EdQsRyQHqS9PghgdyKFYIxk8khx3OyfYMb47EwB3pDsfsnnXqEEcmuP1K+p3Fj9lTcPsDrww/RjcVdsGXLoxeGM9lgzcZQx4IoMjZP6Nl0IyGcFKwUvThAtQIRyQBPclaUNKAsTlDftTmnG6amO2PBMZBu0MNbA+lqGa43eOCD3g9h8Vlqmo+Lj8TcStFZa6kdXFWOG2/wAyXuPc5asgk7pitpYKumkpaqJssEg0vY4bELOWwOO8YQT2Stks9TUOnt0sWmiqXHJZtsxx7u4qt6L6gw8Qz059KSB4O/0SCP2q64sonW+Wos1W41FK5h8kkeckY3DT4hZDhR76XiGnmI3aSw5PYRheXnl1lsUpU0bu/v8ALKvyeMHqYxqlKrYqs1z32ujdpgyG1UwOwH0B4lKvM1S+misdBJiuubi57h/Ewjm8nsVDUTQzTxcLcNBr3Nk0zVhJxnG5HeeacJqRspps31FW0pooXRviYCMBuobYOP2KQJmHfU13qcCqaKzWWgFHbRRCeeUaQ92cnHpOP/ntVj8RWuIgeT4ee5xGFtRsmic2QFuOr9qbe7wTdNRRMr6hjXSaGxxlrS8nBOc/YpTqSPHJ3vQMi5z2IiB9EH2JF3jFLb31ERcHsLTz5+cBhSQ0ElFCI0jWvjLXRg9xTZa0NADcYCmmMYTZj35J0BCIHaE1IGjs+pT3wjGcJoxjO4SoZAIB5AJOO4Kc6Jp2xhJ6hvdlKhWzF8e8Py3SkZVUTM1sJ2xtrb3Fc7nmmAf10ZY/0XtPYRsu9CPBxssB0hcP9bV+VUbWMc5oc9gGNZWsZUOKbMhbpHRDOvGRstJbpzLI0HGlo3GfBY8mSKcxSBzXMOMOUymr5YvMGB53vTlj7I3xZXBmoq6iN8ETImNaZXloPhjdKilfpqNg5lOBoHf34UGlnZPRhw818A8x3YcqNFWFkTpHOw5zeQ7MbrNQrTO75r2TrtUTiN7JWFnyTHgNPoOJ2HtCp21E1QZgMB0xaS3sOD2KPU3J87XMcSXu5DPM9hSHVkdKyAxkOljcS49+VooHJlzWO1Tj5K10WATkOb2o4KxnURa2APA7DjI+9Vr6skPIBaXE4x68pbGiQBzmkuBBHd4rXqcykLqJjI9oA9BunffO603CVrkmq46+VoZGB5oIzqPf4KqsNqmraxhcC2LPnnHZ3BdFoKZkTQ3QdiWt7iFlKSSNIwcmXVv2jwOwq8dNpjiHVMdlg3Ko6BxcRtsVfMYHUsbsciQuSLuR0ZY/oCOowP3iP3KVDWlpBNPF7lHawDkE+yNvctaOItornbSwB1vl1dp6wYQfXUpI6uicPzngqBG2PbLVIYIRzaVdILY8awBhcKVvPAyUYqZP5GP3JqfBh2HaCnafGcEKaTC2LbUSHYwxp1lRJ2RRe5ABvcEoac+iEOI+wbJpB/FRH2J4TSY2ii9ySwgfNCea4EeiEuoWG2ab6ESda+Q/Ni9yJrh9Fqca89wSoLZQX6jM9WyZ0ELsDu2VTf6iSisFdU6Y2FkJA0tAwTsPtWylGvnG1w8Qs50hRws4KujnRtaGwhxPqcEmkEpWjkLHGNoIdg4x60ZqNMQjxhjc/wDFR6R0ldV9XTwyzO5AMaSuhcD8BOqamKpvwHUtdq8mB3fvtqPYPBc0rbpHlvE5yNH0G8Nz01PJxHVRljqmPq6ZjhuGZ3d4Zx7l1Esce5JpmtbG1rGBrWgBrR2DuTxBXRGNKjuxw6KirumSY4hjz3AKi4zj8q6Pq6GRwY2SNjM92ZGhaGufC2pi1kDGT9SzXSJTip4OiohMYhJIZdQ7eqBkx7wENJI0fhqYouogjgYBpjYGD1AYTFQDpPqU6J3WU0UuPTY13vAKbmYC0q0BgeMY82evyP4h/wBicsIzbqY/6Fn2BSeNIyLHcdv4h/2IrEwfFlL/AKln9kLSiSZo22SXNUkN2TbwqiSyOWLUWJv+K6Y+B+0rOELU2Fv+Kac+v7VtElnibpV+T6R+I2Y5XGX7VM4DiqDwxf5HtAhfSyFp7SQ3HuTXS1C+bpZ4lhYNzcpB9i01lpo4eH7hSRDDPiyT36TkrdEnM8gtbkA7BIdDGT6A9yca3LR6ksNRYyN5NET6I9iHkkR5ah7VJAR4RYqIT6OPOzn+9JNG08nlTSEWnxRYUV76Nx+ckmlef4wKxwkOGN0WHUgeRnO8gRijb2uJUw80EWOiMKaNu2MpQp4/op33oj7UWFDfUxj5qPq2fRCcBQKdicRvq2jk1ILRnkE9nZIwpbFQluB2IE5SsI0dgoblyYZMc9J+xORgvo4SefVt+xG0ZdpwTnsT0Lc07NsbYx6kxshPbgHKrSf3S3b53JXMzcAqjJ/dQ/OVJiLl/NJIBKU5J7VDY6C0lDBASt+9EeSSsYgklEUZGBzSdu9AhJyiOSlFEqER6guDsDGEbW/JB6KoO+yYe86dOcBUA657QzIO6juOdzulRR5jLieRwlaWg8kbExDATyB9SdZC8uA04z3pUbomDOCT4IxVSNd5sYJxjfdMCQLXO5mtssJ/JDt0w+jkaMue1LoC5lR1knmgA7exOyzMII1ckrAi+Tu5agidTkDZ2U6Jmh5O/JE6ZpPLCaAjOY4JcLHE6uWO9OEgnmnWhunYIAEJzI49uBlT7U8x3SkkG2iojdnuw8KBA0dbKT4BSIjpkaR2EH60Ae7XZNWT2ElOFqRD5xhd3tafe1SCMKWRZHc3ZMEHUppblMOHnIoRwT4QNOfwkgl1HzqUtA964ww5jbnuC798IWnAqLfUgHkWH3rgUYw3HdlUikBGQggnQzvOCjAOVIMR7kBH4LzqOkY0lGGnuUgRpQjRQhhrSBulgJ5saUI0gGQEprd082LdLbH3IAYkmbBGHOBcScNA5kqNDTud8tU+c8nZuchoVjNTMmhLX5bp84OHYR2qAyvYYzGIZJJB9FmGkd6ErC6HJqfylgAcWPYcscB6JTlNKZIPlQ1r2uLHY5ZHaFVk3KSuGmUQxhmXbe5ORCaDTG57XhhLpdPPcc1fRk90W0LgcjuOE8Aq+3yCeMSxHUwnn3q0jGWBZu0VYjTultbhLa1OadsJDG2hL3Sww9yUGHuTodjePWix61IbH4I+r8E0JjACPSU+2NFpaZCwObrAyW53A9SGgGNKGkp8x+CkU0LdWXDKSVhaGY4HdWXO7lEc3dXdS0CE6R2Koc3zyPBDVAmSeG2Zuj/CFyuo2bqBwpHmuqHEcose8q86oDsXRjWjKfomEbhSQE3G3CeC1RmxOEeErKMFqbRA3hHhODCG3ggY24KLNndTiBhMObkk4QNELSe1N6mGcwBw6wN1ae3Hf6lPEY7lGuVtjrI2PEpp6iI5inbzYf2jvCloZyzpNMTZahkrSS/0MDk4DOfBc4p5HCdlW0hshaHAHbJ5Ld9JVdVRVVVQ3amENS6MmOaLeKYYO47j4LG19A6ThexTQt+VdRgk45ua4rzOXjUthNJx0Qp7o6ltNbaoY5vjqpqupnkcTnqxyY31kroXDVjorLZ6JuuMSNk11Mv5WgkjPcFheHquhrukygr6oNhimqQXBx26zRjPtcFprnWniS90vDtE4RwyVL5KtzHYwxhIPvCXHikicZb8M1cNdU1l/lkAhbmGlaeYjB3djxcr2GSJ0j3SSDUG68dze9QILRFBYpBHKyOkdqdGMciXjH2fWrhtK7z5HuDesg6vfsP/AJK36s6VJEWnmh+MK13WNAEUT8n6ODv9akvkiDmsMjdTiQBnmRzUWKhc+414eWmN1PFTkHnsMlOQUEkEjSJy4Nc4nU3ctLsgfsRVGhD4nBFkqMDfLP7bU/CMpHFOfiSb8+P+2E9Tt2CEJjjmDCac0hScZSHtPcgLIrxkJgtUwt35JDmIGmRtKSQVJLfBIczHYl6FkfBzlU/EMWvGRnzBj3q/bE9zwxrCXHkO9QrzC1lQIw4P0sAJHIntUSdG2FXI5jxJaW1BD2gNkxzHNY2pZPRSaJWkaSRnvXXbhSBxLtOT2YWWu1tbM4xys1tOPYqxZfo0yYjEx3CRjHAPOMAc0l1xkLTj2qyruGpo5D1LstIJ3UKntVW1/nwu2wdhzHaulOLMW5LRBFTI9wPJ2RhGwkk6jkqdTWuoqI/MieDrIJx2Aq5t3C00hD5vNOrGAM5HeqckiKbKWigllAa1jn4xs0ZWss9ifJvOCxp3x3LQWi0U1HHhkW+dyeZVtHE7sbk5Gw5BYTzrw3x4iLbqeOBrGaQA3swrmCN0bNLiXdvsUaOEtmJkdjsx3BTYAXEOI39EArklKzqhBIlULcMB04yPcr+iaXUcgAyW4cqikBDQDz5K6tMnVuGRkciO8KIumaZI3GhLQnmgqTV0RgxIwaoH+i7u8Cm2tXSnZ5bi0wMCeaN0UbU7jfkqECUZiIS6cHUdkenzEuBu52SAdCWAgG7JxrVQAaNk60JLRhOsCLAU0JxoRMCca0nsUsYRGkEnkqHienprnbJKCqBdBIRra041AHOD4bK+qQepICqnUrppMHJCliKa20TItMNFTxwRjk2NuEit45tNgq3UsMEtxrGbPawgMYe4nvUfju/NtEIs9sJ+MJm5kkH8S0/tKwNKIKaJwGXSk5O2d+8nvXJlyqHhz5Mscfh1nh7pRbV1kUNfbG0scjg3rGS6tGeRI7ltbnU1MDC4uOnnnwXmisqHEOJ80Y7Nl2lzuIv8F1JRsqi66y0jHEy+kzcEDPbtss8HJlNuww5XL00lni8qmfVVTgGt3BccBUfE3EHC4Gia6Ur3x09U0AP1ASOZhrfXjK4/XVV6klfT3Cqq+sadLonPPux2rW9HHAsF4t9ZV3SMtgpy6ZkWMGRxjOknwGM4Q+X2l1iipZHdHb6RuaCmI5dSz+yEJG4BCVZ/Ps1C7Oc00Z/qhOyM2K9GKNPoxfGceqyXAAc6d/2JmwN1WmkcP5Bn2BWfE8Oq11rcc4H/ANkqBwy3/EdF/qGfYtX4STSMe5MSc1KkHamXhCExnG2VqrAM2eDblq+1ZjB5LVcODNmiP5TvtWqIPG/SuwRdLvEuRg/GLz9QV1ZHNNursnGq2S/2SqfppGnpg4mH/wCIH+y1WnD/AJ1HOB222Uf1StrJk60c3aPMb6gjwnGDETduwIYyexFjQ3hBOaUkg5RYxGECErB7igkIRpSXNyplvoqy410VDb6WWqqZnaY4om6nOPgu7dH3wdqyrjireL611HGd/I6cgyf0nch7E7HdHnvqz3FT6Dh6/XB48gs1xqdXLqqZ7gfbhe4eGujngzh2JrLbw/Rh7RvLMzrJHeJLsrVMjDAGsaGtAwA0YCQN2eB2dHfHbxlvCN6I7/JHKPXcD8ZUbNdTwteYmDmTRvx9QX0C0k9/vRgEcifegVnziqqOrpXFlTTTQOHMSRlpHvUftx2hfRi5Wm3XKJ0VwoKWrY4YLZoWvB94XLeNvg/cFX3XNa4prJVkHDqc5jJ8WH9iY7PHSGFuOk/ot4p4BldJcKbyq3E4jroATGfB30T61hQ8Y5hDBCkWUkvBKGrKQEq273GlH+mZ/aCl1401VSMHaeTH6RWt+D1w7a+KOlS32u8QGek6maYxh5bqcxuW5I3xkr1HN0K9G0r3Pfw2wuc4uJ8ok3J59qYmeHJyD5vaqJwPlQ2+cvfZ6DejAnJ4Xiz/AK+T+8mT0C9FWvV+Csec8/KJP7yakI8THBaCEnC9wf4DOi//AKLx/wC0Sf3kP8BnRf8A9GI/9ok/vJWB4eKSTsvcZ6DOi/8A6Lx/7RJ/eRf4C+i7/ovH/tEn95Fjs8NO3CSB617n/wABXRd/0Xj/ANok/vIv8BXRd/0Xj/2iT+8iwPDBBykuOnmQvdP+Arou/wCi8f8AtEn95Eegforcd+Fov9ok/vJpoR4Tla0gu8FBeCXZWr6Q7fS2nje+2qgaWUtHXywwtJyQ1rsAZWWOdyrSAXTnzHt7ilbZ5IqXOHkos+emIWR3BEHju3T0PnPGU1VtDZiGjGUrEAP23O6LGU3ndAkntSoY6wAuxnHjlWRt9vEszfjRulpAY7Qd/EqoGexPNJ0kE80XQyyNttZk829xae8xnKFVS0kEbXQXCOqJdjDWkYHfuq1gIPNPN2VITFRbSSD1FOE6WFx5AEplp+XP5TQnXnEMn5h+xAHu+zES2y3y/Tp4SPawKw0ZVTwpIJeGLLN9Khpj/wCG1XmlSzMYe3A2UZw3UyQJhzfOQBx34ReplJazya6cgn2LzzjDnjuc4fWV6T+EVCDYaKQjZspI9eF5ulBFRMD2SO+1XEaEjcIYQwjTKPQpcB2JJeFlKaW6PmEJu0Ejy5rWjB7TyVnWxXSln6l9bTswXNJIOQQcYXk96OxQsuA8HknWnIWWluF2pZTE6OCRwAOWv5qxsVzqaqR0VVTdSQMsOdnJqfYHCi7Gcck40ck+2A4TjYHYV7IdEYDwSgE+YCOxLbA7nhFCGNiwgg7qFPBLEzNK892l24Vr1LuWlJniLItRGwOSqiTJGdgmFYHPa3Dmu0ub3I4oXRzmRz9snbHfscpy2w/uiqIGGktIzzJwpbYHl52wMfOWhkRbc009aYxkRyjLGAbA9qtKV5Mj293YoZgc2qpng6dTiCT27clY0FO91S923JZzRpAex3AJ1g25BP8Ak7h2N96d8kly0YYS7lhymirI7duxLB7cDKcEJB84Y8EIIZJ5RHG3LjyCKASD3oAA8hk+CkChqO1n1hF5LM0504x4p9WFmWqOMbNC98YdO97HFrmiPBBHgVieILs+biua5UFRPEyQMDHA6SMNwRjljK3PE3BcV3nfVwHyWtI/fB6L/wA4ftWLvHCPEFMY2T0bSwytYJ2PBZv2nuXFnllWkc2Vz+jW8McUwVMEsVzlbHNCAdePTB8O8LT9YRgg+acEFZfgCzWyic99XWNmrZWBpjlAaGZJ2APatnOxjC1ry1ufR35rfiyl1/YrG3Wwg4SQn1KBIzByrLQGR6QFCf57j4LaRsmWXB0YdLWO7cNCvDTuPzmhVfBjC01f9FXxHcF0Y1+plP0jCmd2SN9yPyeT+UZ7lI3RbrSiRjyeT+VZ+iUoUzsZ65vq0p3LkppPagX2MshJHpD3I/Jz9Ie5LgyIWp0b8kmMYFPtu5A02RsUzW3FsU/ktHC6rqvoMPms/OdyChy2qur8m6XGRrD/AJvSksaB4u5lADV6vVms+G1ldGJTyij8959gWU4klvvFtv8AILTaZqSkc9r3VVS/qycdw5rXQ2Wktxza7bRtkd6UkuS/37pqrFzDsy3qkph9GODWR70qslnEeOuHaux0sstdXtnihwXkFx0+9Z+mbX0dIxzC91K8dYxkjToORzaexbDpVp6iSOqnfc7hUxN9N0lMI4vWoNBwde7hZaJlvfURNlgbIx09QOr0nta0di83kYbeg6s5tVQSD5UjSc643A9ueavLNWPiqo6Oja83KueGax2MIwR7Tk+xWHGXCddYKcU04609WJWzRA6c53BTXDVCy3cU2q5OrC4NmG3V50t05OfesccHDTHGEkdYr6WSlt1uphG+WKmdrlx29XG4jPgXYTl3jnrY2xPpHRU/lUA63V83Zx+taaJrSNZY18T25BByCCnKuZjfkhEJGlmoZG3ok/sXpKGjZOmZSJr/AC6VzRKAawA9uW9TzPhlC1srvPjq2uJaxmlx+dnJ942CuonOF1ukAjb8mxs+cEHeMftCsWUhMLHO5uaCVDgzRSRi+LWFtjlzkfKRD+uE7DjCsOP6Us4Xnc0b9dD/AGwqukZM7J0lR1oOyZMaAUZbslwwS6M4QMUnaEUHpHLURaFJML8Z0rN8W8V2vh6ENmcaiqftHTxnzneJ7gmot+BdFvIGsYXvc1jQMknYBc1416SBSvdRWCJj35w+peMgfmj9pWb4i43vF3ZI2QilgJx1TD2d2Vj5pC6QuG4XRDjfbJ+XZ6H4MlYOFaWrbLJPV1sYkqJ5HZcSfmjsAHgiq2kyklZ7oirm1XC7KYu8+ncWYz7f2rU1Iy/T3heZnbU2j1OPFdbKerjw3UAfZ2qrmpGNe8loJG7fFaKpiJjw04KhviLnOc5gwfqWKdHQ42Z0QNLw3ScnIyexM1NvkbE4wgBzhhu31q8loyC52C0E5JISXxyNi9HJZ83lstVMyeMpIItDGktLCAc4GxPIH7VZ0cRLtJBbudsJzyJ5d5riT48z4KZS05ZJpOQR29gCHNgsaExBrGuJ1DbOClxBj2lxGMg7AcvFOVMLy05adwQ055hIiicGagCSdgB3JXZaVDrm62DB1Z2BUuja4u1y4JAA9qbhDtDWujwDjPerCljbnS3kFLZajsXA06s4VlRNy7GN+YUcR6cEBSaYFsjXBSOSL+1VLWsdDOwPifs5p7VT8fyVnDlsN6t9v+MrdFvUxNl0zQt+kOxwU9h1NDme5ReM7uy3cHXSeZ3mCmc0jvyMAe9a4pftRy5saqxrg272riijM9tqXCRg+Ugkb8oz2do8VdmgcDgn6l5g4Rv1fY7hT19DVSU1TE3Aew8vDxHgu0cO9Lvl1NGziCqfSyuw0VAYOqf68DzSvSeDVo8uWSnRtpoeqbzDgnKencW6iMZ8EUVRNVUzXRztngf5zXMwQ7xBCeY6oxtI4epYtUX2scbTOA5JbYD3H3JAfU8uscla6gDd7lG/ooX1BHPKcbF3BMtdP2vcnY3VHY8j2JAOtixzynWM8E210/8AKOS2mfl1jkqY7Fvg1txn6lGq/J7fRT1tQfk4GGR3jgch4nkpkZm+m5PZkcW6w1wacjU0HdTQjznUz3O6VctZJTVBmneZHBsTidzkDl2DAV1YeDOJ7t8nS2eaKMnLpJ/k2/Xuu/wTVBxu0HwYArGB82POeT61zPjXK2cz4/Z2znfBnRPTUFVHX3+dldNGQ6OBgxEwjkSebsLe3K1MqYiCAHY2OFYsc89pS/O2J3wtY44x8N4Y1FHHeLZ+HLZdBT3C4QGrYeTG6nMPiRyVz0cXSnq6W+Ultkjr5C8luHhrnamEA4PZ2LA9K3BNbw/f6i7U7Zam3VsrpjJjU6Fzjktd4dxWTpZX08rKqjnkgladnxPLT9S4MuRYp3Rjkn1PUPCj3TcMWyR7Ax3krGuGc4IGD9inSNWF6EuIJrlYjZqpoM1A0GN/04ye3xBW+kacdy9PDNTipI0hK0ZriFgNBVDHOJ4+oqn4Wb/iGh/1DPsWhu0Wunna7tjcPqKouFN7BQkfyDV0y8FeyfI1RHtVhINlFkakhsjYWu4YbmyR7fOd9qypC1/Crf8AErP9Y/7VoiDxn06DR0zcSt/69n+q1WXDLdVM/wD+Hy/2CoHT61rOmviTxq2n+o1WvCDQYCDyNvl/sFarwUkc2jHyTc9wR4SmAdW31BKDVJQjCS5qe0+pNSyRt2c4Ap2FCMeKm2O0198vFNaLVTOqa2pfoijb2nvPcB3qD10GPTC9U/BN4Eit/DzuM66EGsuI00eobxwjtHcXH6k0KzX9D/RdZ+A7YyQxx1d6lZ+6Kxzdx+QzuaPrXQdIT+hDT4IJGNKGkdyf0+CGnwQAxpQ0BP6fBDT4IAY0BDQO5P6fBDT4IAg19DSV9FLRVtNFUU0zSySKRuprwewheNvhH9D7+CK4X6xMkfw/UyYMfM0jz80ntaewr2vp8FXcTWOg4gsVZZ7nE2WlqojHI09xHMeI5oA+ajDv2p4q4454cquEuMLlw/Wg9bRzlgcfns5td7QQVUuA2QUdY+CUAemuhyQP3FVf2AvaugLxb8Egf+22g/7FVf2AvbOnwQJjGgIaAn9Pghp8ECGNCGgJ/T4IafBADGgIaAn9Pghp8EAMaAhoCf0+CGnwQAxoCAYMj1p/T4Iadx60AfNzpZJHS3xWOz4zqNv6SyZ5Fa/pcYB0vcVHPO51H9pY8nchapaAdpcljgic3S/C6V0O9DXEfSTZ6252W5WylipKgQPbVF4c4lucjSDstv8A+ijx4Xb3zh8/0pf7qGxHA4DiQetKrhl2QrDiW0VHDnE9xsNY+KSpt9Q6CR0ZJaXN7RnsUQFrn5fy8UwIPYgAnajR1p0ej2JrVvyUgGEoJAOSlFwCBi3OxhOjkoxOs7BPtdthNC+w3uxKwDuKdbu12d/NI+pM8357gltJAOCqboD3L0euEvR9w5LnOq20x/qALTYwsj0RkydFPDEmST8WQ/VkLaEZ3wokQMkDCZcPOUlzUy4bqUCOZfCDhEnBgk2zHJ9q8wVQxVzeL8/UF6l+EGS3gGVw/lWfavLdw2rph4g+8BaRGhpFuhlDKTY7O7S2SO2xVNPBI584r6eaMvbuGszkZ8chOcY26d5oKqJ+mSpEss++2TM7H1K/uUebnUHvcPtUq+xMkp6KMNy5jdJ27dZK43FfZvGT9OcVdorJLpI4uGWgDJ7NlfUNukgbRa3aiwHO3eVoqqJstzqahzMa35xhP1lF1U8bMABrQfV2qelFSm36PxU+pocOSfFPtyUuj8kEUbXVVOM/6QJ7XTOcQyaJ3qeFoqM3ZX9QDzCWIAAp7Y2OOxBPrCWafHMKqQtrZW9QCfRTdzhZHbZ3uIDRGeYzzVyyAbbKJf4mmiig83M07Gb9oByfsTUSXIylHSyx1NSyPctcxrTINT/RHIDYBPGj+TkmnkaC3HM4A8VbUcMIfXa58fukgtZho2A9qYcWCKSBsLJHPBADmkjCtRM2yqrTTGamEdR1r+sBz2cuas6V0DZdbXZBHcVItvD9E6NhqX1jNJGGwtAAaOzdPzw1FPNHR258plqhJHCZg0huBnJ7tvtS62NSoD5qZsD5XvLWtbnOgo6WahnY1zKmM53x2qxpaGovVqY2GY00ZpGvqTJpJLhtge0FWEtrp4ZKmj+MIXDTHUR/Jt1EHZwB9apYkS8jKUdS8/JzRv8AU4I6GB7qtrA0ZwSN8bLPXeOvpLrLQBkTqSSEzCYtw5ozhw27jjdXHCtbTQXWkprox8uY3NhELusZIMbZPfz2SeJJlfI2WUjcbRxSyHPJrdvfyUSaV8Z/gznHua4E/Utk2CGsLWvnEdO30adrsH+l9yfrIbZbbdJVPdFFTxN1OIAVfGie7OdXO+0lsovKKqlrWvLwyOPqjl7j2A8vaqavvM1zt3kNwtVRbppKqARF27ZB1gyM9+OxdGqLlZZQGh7XgkFuto+wrEcY1FLBaqE63yQQXdjo9Iy7QBnH7Fz5oa0PbIXH9jpJquprsOEraPrMMHN4dhu3qyshQcM8SXihjmdLNTb/ACZmkILG94WwtF/bX3KsuNbQ1j4Y5DGeqaC2MNG2Rzccdy09qraO6tlloXiSON4bqHIgjIIXKsHdiqjOUdXebOyGHiGOOekwGeWw5809msftV2acA6m4IO4I7VbS0zJad0UjGvY4Yc1wyCO4qHb6LySkbS6i5kRIjLjuG9g9i6FicVRrFk/hVmk1PjhXOFAsDNIqDjbZWWF0Q0iGxvCGEvGUYCuxWNacowDjklkIyPMPqKKHY3C35FvqQkiEjCx2dJ54OE7E35Fm3zQj0qWBHggip4+rgjbGzngDmlEJxwSHIENHmmo4YoyTHG1hPMgJ93NJaPO3SGjlXTYccLXE97D9oWo4XoxFa7JEd9FqiHtIasv044ZwpW52y3n/AElvLUwRNom49CihZ/VCiSTLSBfuHqa82l9PK4x4laA5vMZ5/Uua23hMW+80s4gLXUTp2ytefSz6B/RwutR1YbK6knaGmR4dE8cnYzketU/F8Tn1lKxk7acVOIi/TnzhyWc4J7NsUtpMj8KysnofJHnVLD6OebmkfsK0UVLG5jAI2kEd3s+9Y6ntV2t91iPVEhrwOsYdiO1a/hr4xcas1rWin64+SHtLPHwytkbcnFG7iwoqami8tmkZGxgldre7saGjOT3KHTXC21bXG3yOq448Nc+BmprT3ZXO+mS+XKv4kqeDqGR8FFE8S1z2HBmLsEM9WBut10U0jKfhiQRNAiM5aw/SwAD9aWrGuFP+P878GOPaXVw64HOHVEI/rKDQUXneiVo+N4HPs0TWtLi6sh29pWI4n4+4d4XBgmqG1daP83hOoj145JPG2cSlRoZYI4IHSzPZFEwZc5xwAFjL90gcN2mN7mysnI2yThvs7SuW9IHHt44raY5QaK3tPydLE7Gr8p57fUsIGML9Tmgkcidytocb7YpZEje8TdJl5vJfBbAKGm5dZpw5w8B+0rFTOPWOmfI+WV/pyPdlxSde2BgJEp81dCxxj4Zdmxip85hUPUR2qW85bhRcbkEIkVE1fRjffiu/iGZ4bBVYbk8g4ff+xdsxrAf3heZiSCNJLSDkEcwV2/oz4lbfLO2nne0V1KAyVufSHY72ryOZir9kerw83/2s07oyRukCEbhStOyWGry27PVSI76bUzcZx3qNJRjfPokYIxsVbsAOxCBiBGCNlcWDSZVeTs0jIGociNkOq1+k0AjbKnyQknATTonN9IIslRRDlgBe3IOAnIKQAgjuxjClNiDgMKRFFpOEWNRI7aVoA8E8xrW7Dmny0JLmgkYQyqDbuOadiGwHamfRCUxxJBBSsTiToHOacg7D61y7p74iHU01gp5BlxE1Q0Hfb0QtvxTf6fh+xT3Coc3LRiJh5veeQXnC73CpudzmrqqQvmmcXOJPLwHgurjYu87OPkzUY7BFIeYKubfWhkOk4IIwQdwQs+CW4CmQnLRgr3oVVHgzVuza8McR3Xh+obNZK50MZ3fSynVC/wAMdnsXVeHulizVTGU95o5bZWHA5h0L/Frv2FcBhlcO3CsIKhr2GOUB7T2O3RLDGRCm0emPwrsjcF0j8HkdOyvbPWW+7UzqigqGTMadLtPzT3FeXrTday2t1W2tjYwHLqao+UicPbu32LpnRj0j8P0VXJDeKd1sdOA18sL+tgLuwkDdvrXJk47XhtHIdiFOB2JYg8E/Qz0lfSR1lBUxVVNJ6EsTg5p9oT+nHNYODRr2IrYPBOCDwUloGE6xg7sqeoWyG2LwT8cOeQUhsO/JPsiwEupVjUMPLZTIWboRswFIjaBzUTQ0w2tCbnqoIRu8J6RmuFzQSMjGQsbeZ46SpfB15kcz0yRyKz8L2y7mq4q6thgwCwu84EbEdyw3FPRjYqy/h1DLNamSxTSPbC0OYXMDTsDy5lT6S6mlmjrHujETXZLnvDRj2q2l4gtVzvliitlwpKmSpqZopRHMHOY0sBOw/NXPlWOWmRkivsi9D9pprYL1RNBkqqOqFO+c/Pboa7l2bkrdPZkKFwtRQU9LWVEUbWvq62aWRzR6Xnlo+oKzkbst+PjUIpISiktGdubcQy/mO+wrN8Ht/wDVu3n/AEAWtuLAY5fzXfYVl+EG44boAf5EfauqRH2WMgTD2KY9owmHjdCGRdHetfwoz/EjP9Y/7VlSMFa/hRubIw8/lX/atIko8XfCIb/7ceI24x8vGf8Aw2q44GhdLSGTk1tBKPX5pVX8I4BvTrxFnbM0X+7atH0baZrU5mDqipJXNP5wI/YtPob2ckZIwMbz5JQmZjt9yeYzDAMdiVoxyCiyqIj5hyDXe5dE6JeiJvHllq71V3aWggjqOoiDIg4vIGXHfs3wsHM3EbnHsBPJevehuzGydF9kpDGWSSweUyj8qQ6vswtsST9MM8nFaOZQ/Bttb6iOP8Jqx2pwGPJ2jPeOa9PWi3U9rtVLbaSMR09LC2KNo7GtGAqKxx67tFqB2JO61waqypJ6MsEpSWxnQhoT+nwQ0eCyNxjQub9LvS7w70eaaSoZJcLtI3UyjhcAWjve75o+sroHENfFZ7FXXaf96o6d87/ENGcL51cVXuv4j4irb3cZHSVFZM6VxJzjJ2HqAwPYgDtVX8J/it8+aTh2zRRA7NkdI92PXkLYdHvwlbVdK+O3cV2oWmSQhoqqd5fCCfpA7tHjuvK4Axum5AM7Dn9aCmqPpZA6OeFk0L2yRyNDmOachwPIg9oS9C438D/iKpvfRtLbauQySWmo6hjnHJ6pw1NHs3C7XoQSMaECzKf0IaEqA8ffDc4fbRcZWfiCJuBcKUwykDm+M7fU4Lz9zxvyXrH4d7Gs4W4Ym0jIr5m58DGD+xeTm4HngZaRzVJDs698EMZ6b6Af9Sqv7C9u6F4f+B7Mx/Ttb4xzNFVf7te59CQMY0IaE/oQ0IEQqqelpGB9VUw07ScAyyBgJ7skqN8b2b+eLd/tcf3rz58PV7orHwmGkgGrqSRnY/JtXkZ9XuRjfvymlYH07+OLKOd4t3+1x/eh8c2TBPxxbsDt8rj+9fL6SRzjzPvTrJQ2hnhcCTKWYdnlg5T6gfTv45sf89W3/a4/vR/HNj/nm2/7XH96+Z1KxxbRQ0sFGXzU5e505wM6j2qUygr3u9CztP8ArAP2pUB9J/jmyfzzbf8Aa4/vRG92Mbm820f/ADcf3r5pyxnNRT1EdJqjgdKHQb4I8VVtlYY8P2IGxyjqBpelOpp6rpY4nqqWZk0ElzndG9jstcC47g9qyrhuV0f4PfRlF0p8V3C0S3iS1tpKPygSxwiQu84Nxgkd67c74HdEf/v3V/7A3+8tLSEWfwC2g8BX/H85tz+rC9HBm49awHQR0WQ9Flhr7VDd5LoKypE5kfCI9JDdOMAldGDVm/RnzS6cHFvTHxZg7/Gs32rIBzz87ZezeNvgq0HE3GF14ifxnV0zrjVPqDC2ia4MLjnGdW6obl8EOhpLdU1TeOaxxghfJjyFgzpaTj0vBWpAeUi3CPQCiaC17mk5w4hOJ+kiRHtlGYxjKWfRRt3CKCxhmBlOU4yCUiVuDkJyEgDcoAc07pTW52SdbPpBHHIwOHnDmmM9rdB5c/od4Zcd8UOn3OcFvtOy5x8Hh/X9C1gPPSyVnulculhvmg+CmSIGXt2Ud7cHKmObumJW+cpQzmvwhoi/o7mI5CaMn3rytcP8oSu7C1h/qr1305Qdd0aXM43Y1r/c5eRbiCKsnHOJh+1UhL0Y9qJECUYVUU0eqKunfNcperaXZwQB691KrogDCcZy4b+CkUlRS094fDNPCyXQSGOeA7BB3wpc9G+WnjmaGuY3ByDnOSQCuSTTlo2imomaq2v8qLWnGTlWt7ZT1DJnTPDYHxkZzg4ISZKNzqgvLQMJFdJHFSNfM5jWM5uccBPRNuzlJpKWmDw/YNJA1TOGVIdV2mlo2QyMMVQ8atXXvBYCdufPvyuk1lTb3wxwSmB4c8NIDQS0nbJ7QNlA4htlLWVtPS1Lo2y6GxwOkwfR3x6guaag/s6Yxl/RzmStzOyOmq6t2eboqjLfrXUuA4qqntsTqqsqJjUAOayY+gOW3rWWudp1NNTXUVPFoeS+VjQ0fV2LUWeZ3kRjBDmww64nA7jH7EYnFS9FlTrw2kTGnkoN5ia6ut7HE6Q57yOzZuP2p6zzGpomzBpzySLqxwuNE8wuzokAd2cgu5OzjaIFogMjax0b9P7rl5RZPMJuCnknBlc6pf1j3BgcA3zW/wDFPW5snWXNo8sJZMXhrcA+czOcJihY7ySn+SmdiEOOZQDk9qszsnQU0paQ2mldpHzpQFGFFNUX3R1cDBT03J8mwc8889+AmGxyF20L/wBflMUsEjqmrkEeMyhvp/RaBhCGybZYKZtRV0zYoAYpMnLycat8jwzlXEdvhZXwEeSMM0MkZc/cbAOH2FZWnjkfeZwx5GuNucHHJTp6WUSUu7zqkLfTz2J9qIcR26QefBVObS6WyaH4JGWvGN/bhJ4WoZZLrU2d80GmGLVC5+AQx3a13PIKZvTHx2qqBwdIa4E94cCotxphFcqKppXxBxjwSHaeaGx1Ru7NNUTxhkscT6imlNNMc41Ybs4d+QqXpRa+n4SfSSABlXI1jHNO7SDqUOjqHx3iB00pDpoXNIaMYc3fJxtyzuqfpTvUUHDUMnypb5Thj3N80kDsylKdDjGypoblRUQY2ocyVzSCRoy4py91lPLJS9STNrBewwjdhI7fUuTTXesqZJ6mWYNPLAbz9XctPY79HbGGrlg6xjYW5y7BBzuQe/wXnzy3KmdCg6Nf8XyUdBJTQHPWDWZCSH6u9aGwUANrgraObyeqe0CSQM8yVw289o/tBCoha6mEh5OjaQfWP+KueHKZzLPTsDSQAeXrW2Nf0ZyVDlsqhVOlppYuorIRmWEnO30mntae9OvjDScqPc7fUSwiSnLobhTjVSyEc/yD3tPLCTRXBlxtsVYxpj1gh7DzY4HDmn1FaSdBHZb2QAsn8C1TjhQOHWh0NQ7LgHSAHHqVo6BmfTkx7FaJqhjPgiyO5PGmZy6+UeoBF5Kz8Ym9oCoGNghB2zT6k75MPxiT9EIjTDH7+/8ARCATGmOHVs9QStbe9H5K4DAqP6qSaaXsmB9bUqGgi5pSHYKWKWXtkHuRmlcBu/f1IGRZHDkijBJKleS97kGxBgJBypaGcb6e5NPCVS3VhzsAfpLeVFRHDJCDIARDG0DvOgLl/wAICcmidBrGXzsbp7hnK3HSBPHS2+2nDY3O1SPfnsa1owsp2bYYd3Qurra+SpaCwBrJNTDqHvR8X1c89hdKIXulhkY5jmDI1A59+FmqS5RP8r/dQLhT5YM8jqCs6y6sdbBSRVGI5HNe4E83hpH7VDej1v8Axkutmthr6arpop4KmKUOaDlrs743CvqKVlNam1MuOrhhdK71AE/sXn7g2qnjdbKaJ5y64uaG9jg54yCun9KnEFJYeDG2oVDGVtc3qQxpzIyPPnODRvy2HrV4pOSPPlgcWlJ6Zzukp7nxDeP3MxrrjdpnPL3co2kk6j4Naus3O+cN8AcP0tsrKxpfTwhrII95ZTzLsdmT2lcSZxnU2d75bYRQPfF1QlcA+cN57djSfesLd72+rmkkfLI+R5JfI92XP9ZO66cWF+s7vy3NiscONi8XprekDpGvfExfC6rkobeHkx0lK7SSOzW/mT6sBc9e5jchrWsB7Gjn6zzTMlUHHbHvUeWckY7V2RUUfO7bBWSFztLewJlgODlEXZOUbXbptoaX9gQk9AIy4pDnKGNMaI3TEzd9k84HvTUniVDNExg7FT7Bdaqy3aG40jiJI9nN7HtPMFQJNuSLON1jOKmqZpCTjKz0dwxfaG90Daujma9vJw7Wu7QVdgAjZeaOHL7X2GvFXb5ACf3yJ/oSDuI/au5cE8ZWviKDRC7qKxgzLTPPnDxb9IepeRyOM4bPb43JUtGpiad8hOiPtTYkJ2BAKkREBo1OC4lr07dMadH2hMzRkjluprsHkU0+MuILexWqEQ4BjOQn2HfGMFJ6rD8kecn4GNA7MoChJae5JA35KTgYwmHYDsZHgpsuhLwNJJUSuqaa20MtbWTNigibqe9x2AUPijiS0cP0xmuNQA/5kLN3vPq7PWuHcbcXXDiaqzP8hSMOYqZp2Hi7vK3x4JZHo5suaONbFcf8VTcTXPW0uZQwkinjO230j4lZxmO9ADzclBg1nbkvaw4o40eHmy/IxcTSXKZEMckzEzG6VPN1Y0sPnHt7l0JUczHJKlkQxjU5MiqlecF5APYNlGJzzQBwQQn2ZHUmQSujky1ymNkwRJEcHtHcqnWpEEuHDPJNbDw2XCPFN2sFV19nuE1FI45exhzHJ+czkfWuu8PdNc72RwXi0xtlO3lMcnyR9Y5heemyt1BzcgqdR1rmkAkkHmFnPGpLQ4zp7PWNDxbW1cb5IrSdLY+sDhIC1w8D2pMPHVQwtc60PcOZAfg4XC+BuMKu0SeTNna6llIBZI3U1h9XMD1LqfD1fQ3WtjhrH01I6TYB2zX/AJruRXmZsOWD/U7sc8cls67aKg19sp6008kHXN1dW/m1S5HCIck1bXAQspsZMTAB6uQQ4gf5FRuqJAMMY52CeeE4ulsyl7oYnqnAZzhVtRcJGHOsgetQKO8CtaCGSPJOwiiJHvKso2wyelRuyDjDy0Lizc3HF0dEONNqyrruIKoQvihmLS7YuzjCz12NwdaKmS1VNPJcSMsEpznvxn53cuhvoKMRgPtkRJGTnSoFZbLW9pBtkf8ARxn6l5fJ/INqkdmLjf2ecHy1FwlMtxqqick+e2QnY9ox2YVrYBDZuJrXcaAiKannjl60D0WZw4uP0cHBXZ6bo84UvhniqbdLTznzmzMeWPae/uKsOEejy1W2kuFqlnkrG3CCSnMk2kuYAeQxy559iy4+PLkqX0eXyuPOOT01nCga/huhlH8dGZv03F37VYSt2VF0V17bhwRRN1NfLRF9FKRt50Tiz7AFo5QML6DF4UnooLgw6ZMfRd9iyfBwJ4dovBmPrK19zljY2QuOAAcnu2WU4OGLDTN5kav7RXQ2SWb2pmRuylu58kzJhShkQjdbDhAZsg8Jn/aspp8VsuDmZsgx2TP+0LWJJ4p+Evt088QAj58J/wDDatL0UNYaB+G+e6le32YKo/hRsDOne+bbkQO98TVcdE0h1Qw/TppfqBVvwaOXtyGgdyV2IY29p+1AYUF2JcAWkEZBGCrg8WcUspo6aPiK5shiaGsYJyA0DkAqgkcklxyqU2vCJRUvTScMdIHGHDt9hvFFeZ6iaIOHV1jjLE4EYOW5C2bvhH9I43zZf9i//cuSOJymnHfsQ5N+iUEvDrZ+En0lZ2NlH/yP/wC5JPwluksZ3sv+w/8A7lyB2MptxCdicTp3FfT1x7xLw7W2K4PtjaWtj6qYw0uh+k9x1bLlfI7ndKcRhNsc1x2cPel6P6HCUl3NHHmR4YzzidgG7krpPRz0O8acZVMLqe0T0Nue4a66sYY2NHeAd3HwAToTejtHwHLdNFwpxBcXhwjqayONme3Qw5+1eidKqeAuFbdwbwrRcP2xp6mmZgvI3kcfScfElX2lMkj6UNKkaUkjBO+EAeVPh81zTS8L2kEawaipcPDzWj9q8n0lSeoMBO+Sul/Cj6QYuLul25y0JE1BbwKGmeDs4MPnOHrdlcqiedQcBgkq1F0B2b4GAz8IS2j/AKjWf7te+dK8EfArBPwhraHbHyCs/wB2vf8ApUyAj6UNKkaUNKQHlf8A5QDaw8JeNVU/2GLxyfTXtP4eNqud3t/BVFa6GprKmW4TxsjgjLnOcY24Gyy/Rd8EesrIorjx9d30IeNQt9DgyDwfJyB8Bn1qougZ5YGx1E4HinnNLo8ta4jnkDK+kfCnQv0Z8MwNit3CNukc3GZqpnXyOPeS/K2EFhssEYigs9uiYOTWUrAB9SfYD5YV2ltLbskAinOx/PcoshBGQ0b+C+qFx4S4YuLNFfw7aKloBHylHGdj7Fzvi/4OXRZxBG4x2I2eoIw2a3SGPH9E5afchSQHz9szdRqWF2M0spwfUosVP1kezgfavQXSZ8G3ivgh1Td7PIOILLHTza3xMxURAtPpR/OHi1cAy1rNmlp71SaFZ6H+AAz/ANpN9aMki07/AK1q9siN30Xe5fKmzXi7WSpfU2a6VtunezQ+SlmdG5zeeCRzCsxx9x3g/wDrnf8A/b5PvUyQz6hlhHMEesItK89/ARvV6v3At/nvV1rbjLFc2sY+pmdIWt6sHAJ7Mr0YGZI9azYDGh30T7lC4gY74guPmu/gk3Z+Q5fPnpu4440oelziyjo+KrzT00NzlZFFFWPa1jQ7YAA7BYqTj7jqRhZJxhfXNcCCDXSEEHYjmr6gUMzyZXH8o/ag157Sm8kk5OcpTQtV4IcBceTiknW0buKVGMbpMhypEHqJjz25SdR70QO2EQ5qqGHjxSo9nhJTkIy/GExI9p/BdcJehO075LJ6lv8A4h+9dXaPMb6guRfBK8/obhbnOi41LfVuCuwxt+SZ+aFnIkbcAo87cqY5u6YkaVIzE9MbSOjG+EDOmnP2heO7v/C4/wDUj7SvaXSnB13Rtf2Yz+43kexeL7wPloHDti/atEH2QDlG1BBKxmshbV3iroLl1Vc6p8lAdMXF3XFmdbs92OxaqbiniKyUFps1BchBTPaKgHOpztydOTybnsWqo+jSopbjNWQ8SyxiUyARsp/Na1/NoGcAIXLoqp6ttFI28Pjnp4zG4mDLXtzkbZ2IXjR5CPSpHNZOl3i+IzNfPTPIl1tLo+QHNm3YVs+JeKpbraLcY4WM6yhjr3RYzl2oZGe5HdOhClrKGkp6e9x0r4GubLKKXJmyc5O/MK9t/RqaYDVew8so2UkZEONLW8/etJ8mPxtXslY13TINFbJeJYWVNPXRUlXI0zyuiAODn0TurqnhkpzJa71okmfDJPS1AOA8tb6IPfjsTnC3AMVma5ou8r43uzIxkYAlb9F3/BW1NwpTRMdSSSipt/naIJ26nR556X5yF4tNnqPJDxGUqq+1XE0rJnw1tO+nZJFTZLS1456j2jwU2xU0cFRLVRSOBmo3mWEP1NjJcMAeHYpUvR/SiprDR1TKKnqGsaGRx5c0DORk8s57FPtfCjbfFLFT1DS10LYg5wJJwc5K0wScJ2c+ZwlGkajhJzDbSzkQ7vUq/gCkhqwHfuSUPfp5lh2OPflQLRG6hZoc4P8AUMK0bXR6S10biCMEdhC9zHyIVtnkyxu9FXPCyK7wzyQN6mqi6oufNnLxuCfYcKJbeqgZNRvDNcDtGAc7ZJB9xUh1IwQvpIXaaV3nRl7dUkLs7aT3JNTRzzGGoE8YqmN6uRwbhsje/wACtv5OP+zJ4WJ1RahiPt71FpNOipk0McXVDwPO5bqc2mk1AumjGOWGbphlumbI9xljIdIXDzTyP7ULk4/7JeOX9EOhaz4+maGtx1TSMd+VbzsaK63R8jqkecnsDefvIUKntcsdzkqnPYWOYAA0kHKmGiM1d5RK7DGQhjAHkkEnLj7dkfycf9j+OQjiBmbVVYewfJ8s+IUC6OcZXOZUQuIfDExpjyHb5JHqVhcqGSWldTw9W8SbPL3EEDPhzSJLUySenGGsp4cvDA4nL+z2Yym+Rj/sPikyqrXyPudDA1k2hokc/RFjDeRwsp06VEbuEaGnaJoy2sy3UzAwG8lv7ZbnwVlVVzEFz3aYRrJ0M7R7So3F9iF8p6anfHBJHG57nCX6WPN+tZy5GOrsuGKSZ5gom1rp9Tg/S+UN1YzzK0NU+oZbYWytY9jHAcuXrXT4ejitfUjrvIaWDQcmmcck9xyFNl4KuUlQY3spH0RYMh0nnFwOc7BeXkyJytHSkyPwlcr3c6LBrKRzYY2DQ5m4PzfXyXQ+EKiaXh+klna1srmnWG8s6jyWYs/DtVRSSSGOli1ahiI8t/NWmsEb6K1U9NMW9ZG3DsHYnJK7ePnj9swyQdlw7L+Z2HJYy1mrZd72HOYaN1a4xNAwQ7A1H3rVOrYo43PeQGtBcc9w3WYtUjXWeOc+lUOdM7+kSfswuic4yemRGLRsOE2h1re89spVqQqngtzXWQf6x2Mq4LVvHwiXo0fUiKc0oaQqIsbKMBOBg5owxMBsBLAwlhqUGjwRQ0N4SHck44gdqYkPZnmkxobeSdgjjZnn3I2RkndS4oxns5KW6KPN3wiY2x19JpxrfM0Y9q6lxlwzPxLw5b4KN0TKts7o9Uhw3SWtJz7ly/4RMcn4S2+HS92qZpGlpO2sLtlqmfDWwMefk3TOkaPo+YAVzZMqTqzfHcdmMp+hu4mY6r3SNkIwGhjse9c64xuVFZb/AFNip3i4z26Tq55o3YhbJjdue0jtwu98fca03CVnnu0sfWPGWU0R2dNN81o8O0nsAXj2ouAlmlqaiQunmlfI5jRtqc4kn3ldODGshvL8hliqsvo7pWRPjfT1EdH1Ty9joWee0ntDjyKrLhdSJpJeskkmf6c0jy57/W47qomrXyDchRJ5tvOK7Y44Q8PNnmnkVNi6yskmcdTuSr5ZXE7lCSRp7QmHOz2puVCjF/YvWhr35prPZlAeJKzs0qh7X4Iw45TQx2FHkoTFQ7k96Iu8UjfvRHYJhQHOTb3A9iI+tNSHB2UtlUB+CmyMJR3CIBTRQTdt0pkj4pGyRPcx7TlrmnBHqKIoilKKfpUZOO0bLh/pK4iteiOolbcIW/Nn9LH5w3W8tPS1YKiIeXQVdFL2jRrb7CFxANCLG+y5snFhI6oc3JE9J23jXhurIFNeqMk/Ne/Q761d0l2oJRqhrKd4PayVp/avKR3xkZx3hADTyGPVsub+Cjoj+R/0es31tCw6n1MDSex0gCrLhxXw5QsPlN5omEfNEgcfqXmEuc7Ool35xyiAAPmgD1BC4DK/8lH+jvF56WeHaWIigjqbhJ2aW6G+8rC3zpQ4iuTXx0fVW2Jwx8l5z8fnH9iwm2MoAnOwW+PiQXphk5834PTSTTSOlnlfLI85c97i5zvWSmyQDgJJ1FGxu664RUVo45zlPcmLY0vO/JSYmgDACQxukZTjdiq0ZjoOhpcRsAoTjqJceZT1VJpiwO0qNqymTQbuS9AfBM6HOF+ky2X658TyV7mUM8dLBDTT9V5zmay9xwSeYwPXlefc7L2X/wAnr/zN4r/+Kxf7hqib0C9OZ9MvwZOKuEmz3XhR0vEdmjaZHsDQKyBo72D98Hizf8lcD1OjLmuDmlpIIIwQRzBHYV9aSMhcn6ZOgTgnpHbNXS0/xRfnjzbnSNw5zsbdazIbIOXPDtuYULI16NxR88mTEdqebUkcitr0t9DvG3RnUvfeaDyq06g2K60oLqd+RsHdsZ57O7jglc+a453WqlZLiWkNW5hBacrZ8McSytphBKQ8MOCHbgjsXPWOwp9rmLKjY+kMLWLT0ZtNbR6E4T6R7pQNjZBUsliAx1VS3W0DuDvSH1rfwdIFrulN1VwhfQyObjXnrIj7RuPaF5Zpq6WI7POFeWviCaIgF+3LCifGjNaHHM09np3h2oimga+KaOSMHAcxwI+paKPqGuaRE1zieZC4Z0XcRU3xyaR7xTtrNtTTgF45eGexdaHWCTGqXIPLK+O/I8OWDJ5o97jZlOJr53sMDC5gxyJKxXGXErbVIWRUkZY0A9cXAAE+BT9zqZG0jYvlARk51EFc84zoPjegfTl8jX5yxznFwBHJeZONujo7UrR0Xo64t4enNQ6svtC2cu81r5gNvDK2dAxtTNUTUcscoDxLC9jg5pIxtkd/L2rxlcfK7PN5PcqLqznzdbfNcO8HtC6h0AcQ1tJxZQRUD3zUFc9sVTStdqDQeTwOwg/UvW42RRioHjZ+VKU6aOydF0cUFvcYYnRNrzLVuY7m14me1w+xbCVuR3LG9Ht1hrrzcLUxpbNaairhlGNsOm1N94K2jx616WKV6BKkZ+7xB1PUA4/e3/2SsxwmzFlg9RWvujQ6GYfkO+wrJcLjFohb3ZBXS0SWbwO5MyNUlzcBMSNSQDJAwtlwSM2R3hO/9ixzmkhbTgJubLID2Tu+wK0I8YfCwGnp5u/+opv92FM6LHtZU0GWkvcyRo32AIOVG+FyC3p9u4H4tSn/AMMJXRk7NdaiOR1rZeCZz17gHuGRs532lEHepQ5Zn+USnqiR1j8fpFEKk9sb1OiydkZSHkKIatva149ibfWM73e5S/QJTymnOCivq2dhd7k2aoHkD7kwJD3N71GmqIWenIAolY6R/oYA8XYVPUl+vDjn2qoxtkNmx4PloqvjCyUkwbLFPcaeN7Dye0ytBB8CCV9Ff8G/AAJDeC7AAD+Is+5fNHo3GekThof/AItS/wC9avq8W+cdu1W49RWUNs4V4btjtdt4ftNG76UNHGw+8BW3V+AUjT4IafBSIj6PBDSFI0+CROTHC94jfIWgkMbjLvAZ7UANaQvNnwt+nGl4ZtVTwXwtWMmvlUwx1k0bsijjI3GR8893Yst8Iz4Q/GtFWVfClm4duPCLSHMdV1zB5TKOXyeMtaD3gk+peSZnzVE8s88r5JJHF7nvcS5zjzJJ5lVFCsbILiS4nJ5nKeb+9gducptjSN+aDnubyWiQHd/gUN1/CAtcg7KGsz+qXv3QF8/fgNlzvhA27JP8Aq/92voVp8FnP0ZH0BDSFI0+CGnwUgRjGHEEgEtOR4FH1akafBDT4IAY0ItCkafBDSgCPoQ0KRp8ENPggCOWAjBGexeXPhUfB8pbhb63jXgaibDcYg6aut8LQGVDeZewdj+0gbFeq9PgiMeRjCaYHyKa12kk7Hlg9hTZwMjtXevhn9GTOCOO23y0U4is99LpAxo82GcHL2juznV7SuBFp7Va2I9of8n5XUFL0fcRsqq2lp3OurS0SzNYSOqHLJXpcXezgj/G1v5/jUf3r5Lg6dmlw9qPrHfSd70uoWbLp2kZN0ycXyRPY9j7tM5rmnIcNXMELGYwUW5OUrmrSCw8JQbtlFg8060fI5xyKYxI5bdqawT70tnMIRgElJImwgw9yWGY7E4B4IJjEdWO5ORNwgls5JgevfgdP1dFVU0/xd2lHva1dqic0RNBO4GFw34Fzus6OrxFn97uuR7Yx9y7iwBzduwkLNkissPIhNS6e8Jwxpt8WyVAUnGUIqeC71BjOuhl/sleHbqcilPZ1bh9i951lK6ooKum7JoHx7+LSF5Pruhzi6UxMiNFmMuA1S427006D7OX5ygupwdCHEgb8tW0jSRyaCftQm6EuIGMDhXwHzgD8n39vNJtMo7p1J7ilCF2ORXEvjet/nKr/WlOC83HG1zqv1pXzy47+zv7I7V1TvolARO+i5cWbebh/OlX+uKU283D+dKs+uYpfx2UpnaWsPcUsNPcVxUXu5dlzq/1xR/HlzHK61f60p/x2Lsdq0OI7Ueh3iuLtv1z5G7Vf60pfx7cxyulX+tKl8eQrOzdWUoRkrjIv10ac/GlV7ZEsX+65yLrVfppLAx9jsQjIQ0Hl2LkDeIbx2XWp/TQ/CO8jldar9JDwSQdqOwFqGklcibxHeu27VP6QShxHes5F2qfeEfBIOyOuaSO9GAe8rkjOJ70X6fjapz44x9ieHE17H/vSY+77kfBIaaOrAO7CUNLj2rlR4pvvZdJvcPuRjiq+4/ynKfW1v3JPDIq1R1TQ7vKPQcbFcsbxXff5yk/Rb9yUOLL9y+M3fq2/cj4JC7I6jod3o8O7Vy48XX7GPjI/q2oN4uv3bcXe2NpS+CQdjqIb60WCO9cv/DG/D/3h/4TUPwyvuf8of8AhNTWGQm0zccVOJs9VG3IL4Xjb80qv4YqILhw5RmB4cY4I2uIG2cAFZ6LjKqdH1VayCoZnLnEaXYU3g/iayt4eoqB83kkkefSZsRrJG48FvBSizKSR1y0UkFJbhFBnSw9u+/apkZDm5xyUKx1lNW0Us9LM2WB8hMb2nYhOxShrjz3K9nDfU4p7ZJLfBJLcpPXtPeh1w7lsZ1Y41uAjATQnGeRQ69ueSaEOnASSUgzNKT1rUDFFJDGk7ojKOzKHWDuKllJjzWhZ+4SStuEwa9wAeQBlXrZG7E5Wcvs76SaapfTSvhJ1ao8HHrXHzFJ4/1NsLV7CIa8/KMY/u1NBS5poaamlq6iVsUMLDI97uTWjmVn/wALbaOUVR7h965p068dtmooeHLaZIxLiWtcSMlvzWbd/M+xeVjxznOjsk0kY3pQ41qOKeIHVZe9lFADHRxE+i36R/KKwL5Drec41HcpVTMSd91GkcNBK+nww+OCR58/2lYuSfDdlElmLjuUTpMjCZJBKbkJRFOkxyKLrCkEbIH0VNlUKD0vORlMpYOyaYUOB2EoOTYOQjG5TsVD2rxSXk42STzQe4YwmwoQ44TbuaU4hJcQeSgYARhDKJBFjDAc5wa1rnOJADWjJJPIAKebY+GV0dWTG9vpMAy5p7imbPI6C70kzHhjmSZa4jODg4+tWdQ576iR8pOsuOrPPPakxoivtUb6d0sVXECzTlkh0v37QO0d6rp4JaeV8E7DHKw4c09naPqVucEYKh3d5lmie45eIWsce3DcgZ9myStkkAt35kIafyilIKhhAY70ZR7It8pgABOAYAwMpCWw7IEKwjCLJRoGOBxIAylg7JpvNON5IBDNZ6LfWmGnxUirbmLPcVGbzSvYhZK9mf8AJ6f8zOKv/isX+4avGQ3Xs3/k9f8AmZxV/wDFYv8AcNUzf6gj1GggTgLkHTJ8IHgfo862hFR8d3xu3xfRPB6s/wClk9Fnq3d4LGrGdTvBtzLZUuurqVtCIz5Qakt6oM7derbT69l88/hJSdEDuKM9GDarrC8+WmHAt4PdCCNWc5yR5ncqLpa6X+NekurPx7cOotrXExW2lyynYM9ozl7vynZ8MLBE5AWsY0IdY/fCkUkumoZjvUJpwU/TZMgPcFpGWxVZeMnBHNOtmx2qpY8g4yn2SjOCtlIzcTQ2yukiewB5ADgdjy9q9R9B/GcPEts+LLjK110pWZa93pTxjt8XDtXkWCUh2xWu4L4gq7JeKW40UpbPTyB7cnY94PgRsuXm4I54f7NsE+jPbLIIHnLomO9bcp5lFQ8jRwH/ALsKFw5coL7ZKS8UO9NVRiRv5J7W+w5Csx5oyV8fPDJSaZ7EZ2gpbfbqqMR1FvpJmN5Nkha4D3hSbNbbdR1YlpLfSUzgCNUUDWn3gJllRG3Y6vcs5xDxi+lNLHw4wV9a+o0vg6skFoByCR6JJwAlGMu6synGLVsXwdbxQcaX+rbIXC41M7yMAaSx7R9hWzn7hyWC4FutTd7y2rfRupYpZK57WPPntPWMaQR2YIK3k69nD6cn0U9wbhkn5rvsWR4WwbYz84rYXDdr/UfsWO4Y/wAmAflFdtaMW9lu/kmZAnHk4CZkKnwbEEeK23AIxZZc9k7vsCxGVtuAd7POD2Tn7ArQr2eNPhgkDp+urRzNJSH/AMNNdGH8NtHi54TvwxcD4QFz/wCw0n9hMdFxzXWb/WuH1hax8Bs5/MzTUTNxgiV4/rFJDBnkpFw2uNUMfx8n9sppZs0+hOlvcEh0TD80e5O47kYCAREfC0fNHuTbo2jfGFMeExIEBRQXyIiIOH0lTPK0N9H7m5cnLPP5reCMZF90a4HSNw0T/O1L/vWr6w4C+RvDdybZuJbZd3wumbQ1cVSY2nBcGPDsA9mcYXsen+Gjw9I9rXcDXdpdvtWxFExWeq8IYXnS0fC44HqnMFZw/f6QOO7mtikA9zgV0zgbpl6OuMahlJaOI6dla/0aSqBglJ7gHc/YSoGb/CGEYOUEAUXGXCXDnGFoktXElpprjSvGNMrMlni13Np8QvDfwlPg81/R22biPh101w4ZLiZdQzLRZOwf9Jn5XvX0BTFfS01dRTUdZBHPTzMMcsbxlr2kYIITToD5EswW5BympQQF1j4TnRgejLpFlo6JjhZLgDU25x7G586P1tJx6sLk8pBAC0TEdy+AsSfhBW8f9Qqv92vofhfN74Gt8tHD/Trbq+93Gmt1GaSoiM9RIGRtc5nmguOwyvfX+ETgIMa88Z8Phr26mk3CLBHfzUz9GafCGFk3dJvR204dxzw4P/6jF/eRN6T+jlwyOOuGz/8A1KL+8oA1uAuZ9MfTVwX0YRsgvFU+qukozFb6UB0pH0ndjG+JSuPumbgSwcG3a8W/iuxXCspqZ7qelgro5HyyYw1oaDk74XzX4kvd04iv1Xe7vWS1ldWSmWaWR2SSTyHcByA7AgD1Hc/hm3x1U/4s4JtzIAfN8oq3uefXpACtuE/hlQyVbIeKOD3Qwn0p6Co1FvjocBn2FeOmPDeZRPlc70Rgd6voB9XuAuMuG+ObEy88M3OGupHHS7Ts6N2M6Xt5tPgVocL5w/BY6Qa7gLje2yGoAtNwrTSXGJ0gAc1wbpfv85rjn1ZX0eBBGQoegBhDCNBAHI/hbcIM4t6Eb3GyLXWW1nl9MQMkOj3cB626l82TnSCe1fXu4U0dZQVFJM0OjnjdG8EZBDgQftXyT4moXWriG5Wx/pUdXLAf6Dy39iqIiuA85AtOUpoB5o8dy0EJA32CUGntQISwdk7GmAqTTY6sg7qOUuN2BhTYrGiwiVyIea7dP4Gokc0jA1jKaYCmvPdskl5zgBT9UYixge5MuLeYx7lQJjAJxyKDS4HcYCdBGUJiNIx3pJjTPVnwIZes4P4lhx6Nwhd74yu/wNyx23z3Lzp8B2X/ABTxXE3smp3fU4L0fS+g7s88qJEsTp8ETm7clIG/NE7CkkisYBnzXb+CzVVTaJntDDsTjZa/1kqBU0zHPLiOaUtlRM15O7Hon3IuocPmuWg8kHegKRZqLKcjzK6lYGgmJoBO2yHk0f8AJt9ysquEgQtHLST9aXBStfECcrno3KoUsf8AJN9yMU0YH7yxXIpI/H3pQooyebkdSuxS+TR9sTfch5JEf4lvuV35FF3u96Ao4x2lFCcik8hi59Q1H5HH2QtV4KSPHb70BRsJ7UdRdilFviIyYWlLFHDjenarjyRvYSi8m3S6lWVYooQM9SEYo4s/vDcK1bTpQg35p9RWVgo4MfwdqUKKHn1DR7FYGn32P1JbKc555SoRAZRQdsLfclCigP8AEN9ysWwlLEPiigsrRQQY/eQiNBB/IBWrmHqh2gSD7ETIsjJSKtlUaCDG8IQFvp/5EK1MXigIB2uRQrKk26DG0ISTboP5FXPUD6SSYN9ihxHZUG3QY/eUXxfTjnCrnqduaIwDtKXULKOS2UxYSIfmu+xV9itsE9mpXvblxjGd1qpYwyGR3YGOJPdgFVfD8Do7HSh2C4x59+6hw/YVnT+jZrafgijjGzQ9zfZlaqGGJ7ch5IPcstwaNHBtKPyyfrWhtsvm6V6GPSOafpMNLH9N/vSHUbCdp5h7U4XEnmklxB5rZGfg35D/ANbm+pIfROaxzvLJdhncBPanJM2fJ5CSfQKKCw2UJc0E1cmcdwQNCfxqT3BOsJDB6giLzlILGvI8HJqZD7AgaU/jEnuCWXHKMOJTSCxvyeQDac48WhVl4LTQzt9IBhzntVjVzaGEduFT1xzQTnO+gqZJPRSOJ32SntFHU3KV72iIkhgds9xOzfauLXOumrKuWqqHl8sri97j3lbnpfvImuotEB+TpvOmIPOQjl7AuczOG6eLCovsauTaoRI7JSZThh3SHOCTMfkz2rayBjIPag30ikhL7cKbGgndyI8sIO9JDKTZWgkEEAMlNCHW+ilA4RDkgmACd03Id0p5ATZIJSEBBBDsQUBBBGmAl+S3zSQez1q0huUU8A8sGiZrcOmaM6/zh3+KrEkt5qRWWtTcKNgPUvMzuzAwq4ue8ue85c45Kba0BKymtAGiQQQAYSjjCQgcoAHaltOMJtLYUCHEEQOUaoYoHtSg4pGUAUC8HThzS13aoTgWu0nmNlLbuk1Eeoam+l9qlgyO04K9AfBP6aOGujC3X62cS01wdFXTMqoJaSISHW1mksIJGMgDB5c84Xn0HwShzU1a2I770y/Cb4u4xEtr4YEvDNmdsXRSfuucY+dIPQB+i3fvJXA3HOSTkk5JPae9BHtpTSSGNFH2JLjuhnLUAHkd6m0zMRAnm5RII9RDj6I+tT2btTSAIpTD3lIJwUNWCGjtVNiJ8BA3HJS6abQ8EHdQA7TFtzTkT+3tVJio9P8AwV+LaiaCs4TlqWjANVSB/Z2PaPZg+9druBuEcD3tnbkDsZleJ+jbiOXh3iu23mLOaSdrngH0mcnD3ZXtjinibhuy8OR3m5XCOKjqYw+ADd8wIyA0dq8nnYkn2OrFkaWylt1yr5nOfO7zWAu0tiOTgZVV0QVxuXCVPNIOrkrJppC9owWu606T7MBY6TpqghribdwtJJTg4aZ6oMeR4gA4V/0UcZcJVks1BDKLM+MvqG0tW8NDWudk6H8iASfFcUXFsMmVeWafheqrYOkCttFbSRwyRRzVjHROyx0c0jce3LSfat5M/VlZKaooKfpUtbo5mSS3a0SxseyQOaeqeHDl4ErVvGOZC3xxpk9rRWVxySPWsbw079wkD+UctnVbv9qw3DLh5HKM8p5B7nFdf0ZN7L13JR5E7nLU29SMaAK3HR//AJHqf+0H+yFiDstpwA7/ABTUY/GT/ZarSBPZ45+GWNPT3XHtdQUv9hROi8jy2zEfy7vtCnfDRGOnad3fbqX+yVWdGR/dVn/7Q77QtIgzH3JpF0rMjcVMoP6ZTICfuxJvFcP+tS/2ymWrK7Za8CIwiSnJB5IGJfyUaTOV2b4OfRRZ+k43t11u1bR/FxhaxlK1uXaw45JcDsNOF14/BP4MP/3iv/vi/uKkhdkeJ76SKMn8oLOvPYF7xq/gicE1MRjfxJxCAe4w/wBxQj8DPgPH/OfiT9KH+4tk0Zy2eFzlAEg5BwvQ3wo+gSy9FXDVrvVku9zro6qqNNOyrazzfNLmkFoHcQvPCu0xGot4Ip43HtATdyqTBUQmLIlzq1A4I7sJ63gmljz9EJqvdTsrIJJnEBvhlYP0r6PX3wK+l+68RmfgPieqfU1tNB19tqZTl8kQOHMce0t2we5eol85fgs1s9H07cK9S9oMlY+A5HpMdG/K+jSYgIIIIA8/fDu4XjvPQw+9tiDqix1TKgO7RG8hj/tafYvn5JjsX1L6fqKO4dCnGVNKAWGzVDyD3tYXD6wvlk0t0NJyriJhEA8wCt1FGx/DVrdobvRYBx3PKi9GfRtxl0j1VZBwja21zqJjX1BfM2MMDiQ0ZcdycH3Ls9L8HjpWjsVBSP4fhMkFO5jgK2PYl5Pf3JSY0cBnY3JyxvuVbVtYG5awe5d1n+DV0wPzp4bg/wBui+9QKj4MPTK8YHDVOR/8Qi+9NNfYrOKvAEbHBrdx3ItR2wuh9IvQz0i8AWCO8cUWJtJbzM2DrmVDJQHuzgHSds4K56WnPLZVaYWKaccwie7J0gbIBG1uStPoCbTzPp7PHURO0uirS8esMB/YvrDwlUOq+FrTVSO1PmoYJHHvJjac/WvlPaaWato46CCPXLNcYmMGM5L26cYX1fsNL5DZKGi2/c9NHFt+S0D9iwkMmoIIKQAV8sunOnZTdM3GcDBhrL1U49ryf2r6mlfK3pnrG3Dpf4xq2DDJb1VafUJCM/UnH0GY/tS2ZTeTlOxh2cgHHataJCcEGp2QA7BJxhgxzyh6BCHHZBjsetKwMH1JtvMJAx9xAOR2hJxqcO9FndKYBnJ5hAEmSB7KUSuxpJx7UwHt5Kc94mohCew5UZ7GsAwMhVdggAAhN1IOkAJxhBbskzEFnqRoZ6T+AzIRUcWRE7dVTOH6TgvTUUoZrGD6RXlb4Ds2jiTiaLfz6CJ/uk/4r1FpqJJniIQhgAyXk5JPgFEiGSevb3FEZ2n5pTJgq/pUx/SSTBVj51N/WUhQ+Z29yJ0zTzaUx1dR2up/6y5z0tdKEPR6KEVVsdcZK10rY2wSBujQBkuJ78oQeHSzKz6JSetbn0XLzq34Ssbjk8HzN8PLG/cl/wDpKw/9EZv9sb9ydCdhTNzNDnl1ZP1p+FvyQ2wm5R8vGD2RD7VIhB6sbLjR1sINSm80ekoNbumSAkZQI35JwNHcjLR3JBX2IbySgEAfBKBKLCxJCT/55JxIIwmWFzQI7kaLIQIIA5TjUjOeSW3mlQUOAo0nBSwD3IEIkOI2jvk/YlsOG8u1FO3DISfpuP1I4hlgypooBKCVpwiDSmTQSCXpKIsKbQCUOaPSUpjC44ASoCs4lmMFhqtJw+VvUMA5lzzhORxCGnZCBsxob7giu1I+oulJDqwymb5RICNi47NHuyU/LkAqF6Bu+FmkcI0Q7CXH61b0OWnZV3DwxwtQYG2kqxp9l2xZzS9LUDIyiLd0UZ8wJecLZMgIAYTVWcUsh/JKeymKw4pZPUmAerYIwUQCCmgDQc4NYhkDcqJWSDkCU/BpWM1Mhe49wVHxpdYbFwjc7vPnRTQEtH0nnZo9+Fb52XGfhP34w2u18NwyYNS81dQAd9DNmA+skn2KPWWlRwetqJamplqZ3F0sri95PaTuVBkOU7K5R3lbpUh+iDzQlPmBJckykFihjEZSm774TY5JYPyZ9aBiSclBBBMAbYRt70SNpwgBWSENfikE780EAA7oIIIACCCCAAhlBBAARjkiQ7EwAOaPCSjyosAFBBBUAECSgggAwEtjUTQO1K2A2TEw0Elpy5HlMdhoxySW8koIExQKUCm0pqABJE2QZHmlMuikZzGR3hSmEY5pTVNDogoKcWtPMA+xDQwD0R7k6JK8sc4+a0lOQwDVl/PuUvAITLiQ7KKADxpdhOwEHITcu+ChTuIcmMXtqdnsTQPygOU7NluQRnKjx/vgG/NTdAT5HYaPUnWHDcqLO/5TRywpDfRHqTTEyfQylrsZ5816Y6IuHeHek/o/p4rtPWxXmxk0jZ4ZjkQnzmeadu8exeXYnEb5Xc/gjX4UHSLLa5ZA2K6UjowCcAyM85vtxqCz5GNZIOxxNveOga4QgOtHEsFRjOWVkBZgetuVzjjfgW98K1FMb0KJ7KkubC+CXWDpGTsQCNiF6zvcxho3vadwuG9OPlFy+Kura6XqXSktaMnLtIGy8HJgS2gy4klaOVW64V1prqavoK6enqaYnqXtf6GeYGeS6f0Z8ZdJHE/ElO1t9e+gp3ZrJZYWlmntZy3cfqWc4Y6Pqqs48t3DvE7ZraKyhkrWRRSAyOYw40k/NJ35b4XduF7BS0FnpoLfTx0tKG6mRRjAGe0958Sq4/ZvZhi7fZdPq+tkzjGXLF8Ov0xVY7RWS/2itZVzUVuLfLa2lph/pZWs+0rFcKVdHWmtFLV085NXK7EcgJI1c8L0W1Rt22aOOUFqN7tlGLmxO0uOEDOxwwCmkU2G9262/R07NpqvCpP9kLCE5W46N/8AJVZ/2gf2QqJj6eRfhqf/AG6O/wDhdN/9SpujQ/um0eNUR9iufhseb04td32qn/8AqVH0bvxUWfH439yuPhT0Zm9jTfLi0dlZN/bKjggBW3EXBXGJ4irnQW59Q2eplliEcgJLC4kbFUUtl4pic+N9org5mdQ6rcYWdbLiPOOQkHKjMoOJcfJ2q4PGcZFK4jPrSTR8RCURvtNx1nk3yVwJ+pNRvwGz0f8AAZuXVca8Q2p5aPKqCOZozvmN+D9T168Xz0+D3drtwj0x2K5VtvroKaSY0lU58DgGxyDTk5HYcH2L6FA7K/CH6GggEEAcw+E9wPNx90PXaz0UfWXCACso29rpI99I9YyF8zXxyRSvjljdHIxxa5jhgtIOCCF9gCMrz506fBi4e48uc1/4frRYLzMdU46vVT1DvpOaN2u7yOfcmnQqPFFtOaWL81CtYZGEMG5cMn1Bdwl+C50o0TxDTxWisjbsJWVgaD7HDKtOH/gl8Y3WrjHEt2t9po9eZRA8zykdzQMAe0qfsoo/gT8JT3vpbivvV6qKxROmkkLdute0tY0Hv3cfYveay/RnwLw90fcLQcPcOUggpot3vdvJM/te93afsWoTEBBBBAGI6e6qOi6FuMqiUgNFlqmkn8qMt/avlgT5rR2BfRD4cXEkdk6DK22iQCe9VEVExvaWZ1v+pv1r54SnLtlcQPTn/J2XeOm6ReIbLI8jy62Nljb3uik3+p690YHcF8sugHjAcCdLfD/EUshZSxVIiqj2CGTzH/Uc+xfUuGWOaJksT2yRvaHNc05DgdwQe5S1QC8DuQI2QCCQmZHpc4Ko+P8Ao9u3CtXhorIfkZP5OVu7HewgL5h8XcO3fhXiKtsF8pJKSvo5CyWNwxnucO9p5gr61LCdKvRNwT0lUjI+JrUJKmMYhrIHdXPF6nDmPA5CadDPlw0jOE9G3J7l7NufwLbE+dz7bxvcKdhcSGzUbJCB3ZBCueE/gfcEW+rZPfL5dbyxu5pxpgjd6y3LiPaFfcRyL4F/RtU8U8XNv9yt2bHaallSyd4I6ypYDpY36QGcnuwF7zCr7DZ7ZYbVT2mz0MFDQ0zdEMELNLWj1ftVgobsYEEEEgIV+uMNpstddKhwbDSU8k7yewMaXH7F8lrpWvuV0q7hKcyVM8kzvW9xd+1fQf4afGcfC3QvX0EMwZX3s+QwN7dJ3kPq0jHtXzqjDmHfkU4+gKa0l4HipzIMkanHAPIFRadjpJhp7FLkhe5vmkjnkLZEsTVt0SYHdlMtOyfqxhkRP0MKPnSEmCB9L1JpozyTrTq17c2pDNiShAySIwceHNLEQEpJ5JnrHAA5QfK5w9aQD0s7WNODlRXTPkztgJxrGmmk7XYTLCC0Y5oAfp86N+9KkHmFBjCxoztndG70U0FndvgSyhvHt6iJ9O1fZI3716zpf36X81v7V4/+BnKG9KdZHnBktMox6nNK9f0p+XkA+g37SpYiXyCRIdkWdkTuSkdDROZGDPzgF43+ESw/hu15JJdA8nc41CVwJ92F7FcflWfnBeQ/hIx6OMI3dhZO33Tf8UIlHK8oA+KJDCso9IzNxV+qNoTzXaGBN4cXFxdklJeJDzdsuFG9jwnbncJYkb2BQtLu9ORtcD6SYErrB3FHraewpoNPelBh70CYvV4I9XgkYfnmE4xjsZJ2TRKDGMckCMjkjDXB72Fw8045I8eKRdiA3wQ6vJ5JbcgpXnd4QA2IktsaUGu7wlNbJnILfcgLB1e+wSmM87dGGyd7SlNbJ3tQA3VsJlgYMY84oNYQ3GE86OV8jXjTsCAldVUAbGIJDsaZHnmnBE0DtRltUOyH60l3lQz5kR9qKFYeAAkEDKS91X2Rxj+kkB1Z2si96KCxwNzspsTKahpJq+sfphhYXvOOwft7Eijp6p+HFsYBS+K7ZWVnDNXSRFokIa9oAPnFhDse3CdESkV9JFVvNRWVsbI5alwkbGDkxsx5rT4gKPUlgj58+1WUtVJU29tSxjSHxtd4+cN/cVmTWsEcTHQiBsYIe7JOrfY4WM8kcfor0buepvlv4Upaiip6V0LYtRD8uePysDs8FC4f46ZLVxUV1gjp3SHSydhOgu7NQPorV0cdPV2KgLXMmiMQ0uY/LTtvyXMOkjh34jnbU07S+3VDsAHfqnfR9XcjNPIo94GTkmdiZO5hDS3KeEuebTyWS6L5WXTgmgmq+vfIzXCZOtILwxxAPuWrgoqUNzmpz4zFd3HyfJBSZmGZcfNKZrZsU7st22+1STRU53zUY/1xSJKGne3GucDtzJlbFIbMxz6OUfXbbtKULfCR++TY8HoeQQjlJPv+WimIZln83koMspLjnKmzUUeMCSb9NRTQN/lZf0kmyojGskYAXlfp1unxl0n3iRr9cdK5lHFjsEbQD/WLl6luwp7RaK26yucI6OnfO7Jz6IJH14XiatqJauomq53F0tRI6V5Pa5xJP2qsa2URZT2pt5yjmO2U3nZWxoQ5B5+TKSTuiccjCTQCGnIToxowmmpSRQEEAjKAC70EEEABBBBAAQQQQAENkEMIACCCCAAggggABBBBJABBBBMAIIIIAW07JLjlFkoIFQAcJQOSkox60IKFx8yllNN5pxNMKDCNJQTChxvJONOyYacJQeQgLH8lEUlrspXYgVAHJNSpwg9iJwBG6GCGhvH6kUJxKPWlM+cPBMRuIkHrSsokTuzMR3JqP9+HrRyn5Z2DzSICetRYh956ypHrT7j52M8lHpsOlc49iejOTntSTEPx9i0/AN3dY+K7TdmO0upK2KbOewO3+rKyzH4dhSoDqOD27K34CdPR9GLtTNqIT1e7JRrbv807j6isVU2B000scgbiVhjDjzbnkR7cIuj3jI3TgawVUsQkL6CFrnasEua3SfratFJVsmkhfHAASe1/JeVkjTZv6jA0tXHWdI1prZTEK6iggpJ2585r3SSMePbz9q6Pb5RS8OxVTml3VUzpNI7dIJx9S8r8bX+7T9IN8utKfi+d9aA3qhjzoSWsd6+/1rb0nTldaenpKeWwUJihiDJwZnZl2wSO7O/NcUM8VNxMLStHKbldK2/19TdrrUST1NQ9z8vJIaCThoHYAFHgq6631cFRbXyRVUbwY3M2JdnYeOeWF1Ss6LReJxXcI3AUlBVQsq2wVkRJhfJuI892MlSOjTgKCguEt1vFQK2spJ3RxMa3EUbmnGrxPcoWPJKdmHWTkbmu8rkpaeedumZ0TeuaOQdgZ+tNUr3j0sq0Yetjfq3y481HNOGnPYvVx6Rq0xTHEhb7o2I+Kaz/ALQP7IWAGxW+6N/8lVf/AGj/AOkK2VE8k/Dc26ameNqp/tcs50du/wAkf9t+5aH4bp/9uEfd8UU/2uWZ4AdiG0uz/n33LSHhbOousV6vF2rKix3J7+qhfLLTRyYfoa4ggH6+xIsE1ipnGa+0c1bSta4PjZVAzNI5HGdhlVdXX/F96uNTS1nks9Q18UzWyFrg3OMbc881EoattPTzupqLrHFut7yNIe3kRuuKUZOTSY1I1Ul1llt8z7RSVN2tsMjhAZPkSwkD0nD08ck/UVtfcLM6S5mGw0Q0tjl0GTV3lr/mrN2GrraqZzaCamtkIbrfHrJLj2eadinbpT1lNTC63/8Axza2SAvgNSGtYD29X2kLfCljjTZnJuw+Ibj5JC7yC4zVsLm9W2UyB7g7seCOxek+gbjMcXcGQtqpP8Z0AEFU0nd2B5r/AFEfXleZr7W2KuLxY4wyndHqMbY9GiQDZpyqngrjK78EcRxXOiqdAiIE0PMTM7WH/wA7JuS70T2dnvJBZjo942svGtmjr7VO3rNDTPTOI6yEkZwR+1adWaAQQQQAEEEEABBBAoACSTgc8I8rzH8LDp+puH7fWcE8G1rZr3M0xVlZEctpGnm0EfPx7kAcY+GL0hQcedJUlot1R1tp4fjdBE5h82Wcn5V49waPUV59mbofjmFPoC0Vp612A9rsknmVEqxh+/ariJiCBjfcL6A/Am6Rvwn6NKXhy61ObratcMJed5oGkaSO8tBAPsXgHQTEDhdW6G7rcLHS0F0tdS+mrKeed0cjOefN28QRsQiYI+lgQXJehLptsHHrG2itlitvEcWQ+le7DZ8fOiJ5/m8wutA5UDAggggAIIIIACCCCAAmqqeKngfPNIyOKNpe97jgNaBkknsCFVUQ00Ek9RIyKKNpc973BrWgcySeQXiX4W3wiYeJKap4E4Eq3m1kllxuMZLfKMfxbD9DvPagDm3wpulE9JXSTNNQvebHbA6mt4J9MA+dL/SP1YXI8+5Nk+KME9q0QrJtvGZdlKdKfOiZ6QdhV9LK9ocG5BO2e5WNFA0tJY/Uc88qmSxMoJhaDuRnPqUV3LSVYa2wSzsmbq1xFrT3OPJV8hGrbkhjQUWwd6khu2U+2Mlp049HPsUUO3CQDhRHPgjKAyCgCRb4pZS54aQ0cyeSblpg2Q6cgZUimq9LCx3mNA7O1NS1Eer0s5QH2HuBjKDvRKSJGntQLhjmmgOv/A9lLemWKPOOst1S0/ogr2XT5FS4d7PsK8U/BMkEfTdbGk/vlNUs/wDDXtSnP7tA74nfaFLCiUicUZ5pJ5FSBGm2cPXsvKXwnmNbxPTEgfvtW3+sw/tXq2Y78uS82dPtgrOIuM4rfROiZM2oqpA6U4bp0MJQJHA0FvXdFHEvzam2n/vSP2ImdE/ErjvV21vj1hP7FVoZ1fKXHuU71JPYUQjcHclx0bCmtaj0t54RxtONwliM9idCbEYHcErASurPcj6sp0KxGntCXHnGDyyEoNI7EYadQA70NUCY3Kc1Ep73lAbJbxmd+BzcUZjJ7FJVjY3RpQYQeSUGHuTSCwmlOA9yDWO7ktsZJ5IoTYGEp5hPcEcbSErCKYJh9YR81vuRiUnmB7kjTujDD3IJdii7PMJOA5K0nCJoKBiHs7giEbw3WyF0zuxjTjPtPYpUUTnEHBwp0cIaMJpWDZj7zX8ZwMc+ChgpqcfQPWPA8VmK3iXiDO1dUtyMOGV1wMVbdbNQ1kTmyUsWo/OAwQs8uGbX6sxd2cttHEtdRW+SWV5npg5rWxP5g5OrB9SsqisJpm3InR17yYw4fNOw2R1/D8MFRUSsp3VFHTzyNlY0gFuw84d/qVXxJdLc+nomQR1b4yA9nVxEHI5YztnZeTOGRpxkEro6Z0RR1cFBcoJQ5sDahrmMPJj8YcPDsK1PFluF14ZuFD1IkkkgJiHaHj0SPaqvgG+2CrstLBRGWikcTrgq2lkpf2kk7ElbAMLebcEbYXscKDjhUZGbKvhe1NsnDtDao3A+TQhriPnOO7j7SSrRpc0blDG6PC7YQUVSEEHIZPeUAMIKxh6nd5Q1O70QR4CYCH5KRg57U4B2JYaOaTQ1I5n8JC6/FPRfUU7ZNMtznZStHaW+k/6gPevJ0hwzK7f8Le7GXiSy2NjwWUlK6okbn58hwP6rfrXDZThmAU/C4jUxy0BM5wEsnVkplx7EWWEO1GUWUfPtRYxtp84tygMpL8iX1o4jlmrsUsQ4EEM7IIQwIIIJgBBAI0WNIJBA80ECAhlBBAAQQQwgAIIYQQAaIlBBOwAgggkAEY5IkAUAAoIIIACCCCADbzTo5JkbFOE7IsBQQ3zyTeR3lLBBTsA0YSe1GmA4xOFMjnzS8nvSAW0oOGE252kgp0kFuUCI+WtlHrTcgDZCR3p2bGdu9Nz4Lgcc1NDsJ7vlPYij81rnduEl5zIfUEbe7sSESIvNi25lORnDcpgO2wClvdgAAqkA/THLy5S4Tg81CiOhg7ypEDsuCtEvR6i6Dbpb/wDBva4qqvpKd0Es0eJpQzYPyOfrXYbeaOrhYaSrpqrG+YZWvx7ivGnDIY+xRggHRLIDkd+CrSmqp6KZk9FUzUszDlskMhY4H2Lw+VyVjy9WJ5+ujqfTDwfJSX2S9UzCaOtk+VwNopu32O5rBWKxSXXja12d4IjqalnWHHKMHU8+4FdG4U46dxRwzHw9xIesqzXQh1UBjrIsnDnAfODgArfhXheroX0V4M9NUVFS19AwsPnMe7Zx9jQ4lefkh2yKUSHDs+yOjWxjTRCoa3T17zK0YxhmcMHsaAspZQBWXmMcm18mPbgrcytaxojj2ZGA1o8AMBYe0+bdr+O6vd9bWr3kqiaRLCmb5h9aN7QnIcaDhFIEkEiMRut30bb2qr/7QP7IWFcMFbjo2OLZW/8AaB/ZCtjR5J+HCAOm2E99pg+1yynAx00NsPdXD7AtZ8OTH+GinPb8UQf2nLIcEfwC3kn/AD4fYE4+FHQqr8G38STVVzp5HTtnkjfFE7S4aRlr/FQLNNVS3hjXRmaKqc6Foc3HpcsIE2mr4xnpb1VvoqaOeUvqI26nuOrzWpdPUssXEktTRskq44HZpnSu31djiBsuOUus/wDYhi4Wm6y1TaSvlbQy04A6iRvVukY12PNf2laSpgjaG1NurI55o4QTSOg695eDucjYZ5Kjl4pqblWwycSTeUDrmjrCzV1WTvhvcrjjafhSe6QQ8CfGLrtlsbuqd1TJc9p1fsUQztSUZxG/CDx5TVooaWphtktDTyAyzskA1MlPiOxc/rGYjfuXy+kO5by82m9w8KvmuEodNG8vrGdYSWjOwOefsXO7jWMgwxrSQMkuHYOS6IwayOzNoe4c4uvXD94t9ZZJZqOppXyOEkbyOs1j0XDtA7iu29GfwvaXrI7Z0h2iSGQAZuNA3U095fFzHrbn1Lz9FFRU0jKuWokMrIWSNbp2a8uOR4+audV7tdY+QHmT9q6kk0Uj6n8H9I3A3FsDZeHuKrVXlwHybKgNkGewsdhw9y1eV8fDrjkEjHua4YIc04cD61qbB0l9IVkMbbbxrf6ZjOTW1zy0D1OJCgo+rWUMjvXzss3Th0sugY48b3F2RzeI3fa1N3vps6W5KWd7OO7pG5rDtGI2j17NSsD6LOc1rS5xDQOZOwXPOkLpp6OOB6d7rzxNSSVDRltJRuE87vDS3l7cLwNScecXcQ2uoN/4nvNxY+TS4TVby3JGeWcLJXwQmNxjO/1lUlYHc+mT4U/FPF0c1r4Sp38PWh50Ol16qqZp7C4bMB7h71wapd1kjpZCS9/nOJOck9qiwj/FbXY3NSB7MFSKk5l0jlpTdE7BSwGWobkDA55UO4jDmnvH7Vb0zwyR+Bu1mR7lU3AHSw+sqkgYhnnUxPccLofRuS7h+IfRnn/stK53TnMLm+K6J0ZEfEgHdUTf2Apn4NFXfDNR3gVNPI+KVrtTHscWuaewgjkV2Poy+FPxlwpAyi4npm8S22IACR7+rqmN5bP5O9o9q5FxR/DTsqKZgfS1YxyhLvdhRHYM+gfBHwluibiaJgfxELLVOwDT3NhhIJ7n7tPvXVLXfbJdYmy2y8W+tjcMh1PUskBHsK+SEI1U24zgp6nllp2CSnlkhdn0o3lp94V9QPrzn1oEgDJ2HivktTcU8S07vkOI7zET9GvlH/1I63iTiOqwKniK8y9wfXykf2kqYH1SvXFHDllhfLd79a6BjBkmoq2Mx7yuO9IHwqOjTh2OSKy1NRxNXDZsdEwtiB8ZXADHqyvnzNLLI/rJZHyO7XPcST7SpMRD6c7gYKKGdN6YenvjjpI62jragWu0E+bQUbiGOH5bub/bsuQvwDhTKoNYRpIJxlRHN1uwBv4K6QCDslDLsJZgl+gcI2QyDwVIgtoII2MDdIBICS+n0uD4JCx/gVCbHKXZMrgnhEHek4nxymNDc9RIZDHPu4HmO1JPnei0+1SBG1vIJQGymwoaAcGsPI6SCmTDg5ypZGQm5BtsgY0W9yLBSwD2oIChos1HBQ8madwU6h2YQhDQp8fOSmxYOcpSMbJ2FnSvgxExdNvD7sganTM98bl7dh2ro/zHj7F4Z+DzKYumbhdw5uqy33scF7la4eWw+IePqUsCZndEeSM80Rx3qaCyLU8j6lxrj4EdJ7ezacg+uFhXZ6huRsuYcd8PV9Vxqy6wSQiKMatLjzDotB+sJE/ZTQhzm7lJLsOx2LH1nHr6XiS4cPR8O1lVXUM/UuZFK3zzjOR4YSHcZXdtfHRu4DvQlfyOpuget3JZVs0Rv2Uo7kHUo7lOyB2I9Y7srRRFZXCnGeScEAxyUp7gPmomvGfRR1sLGBTHuQdTnuUwOGPRRhw+ihICG2m35IeTeeDvzCm6sj0U7A0OkaMdoQ4oRVNp/lHZ+kT9adbThTmxDUTjtKWGNHYp6DsrxSgoxS4KsQG9iPA7lSgFkBtPjsShTjPJTcN7kbQM8kdBWyKyDHYj6jw+pTR+ajAHcjqNSIHk/glCDwU3De4I9PbhHQLIRp0GU2XKeGjuSxgdiOgDcMGAO5OFngnA4BvJJ1jKfWibGy2OON8sr2sjYC573HAaBzJVPZuJLDe6yWltdd100Q1FpYW6gOZbnmFH6SnCXhOWjE74BVTxxOcxuSW5yR7cLmNuHxDe4blQTNmNK8kMLgdTSNwcLh5fNXHkkyG60bC+0tXI5tohdHGaqukmc94LmvjbguaQPEhWEVD8lEKhzZHMIwRGGgeodiqOErzLfuJJ6ienZC2npnuYxpJ3keMnPfgLUPwY3ADfsT47jmXYr6NmaWCrpY4poY5oywea5oPYuYcf8ZXGy8RvsNnuEwhpA0yB2CRId9GrngbLrNv0hkWexrV5dudS6s4iuNZIculqpHuP9IgfUE+fl+DFcTFp2dq4P6QzdLjS0NypYonVB6tr4nHZ/ZkHsK3vWALz50dwz13GNtZA3LYZRPKfosb2+/Zd4fIeeCsfxXIy5oNzHRLDtSNVwqC08ipkMwezkSV7FjocKNvikh57kRfvyVBQ5gZ2TkbckN79kyHKp44vDbFwRe7v20lDLI387SQ36yEWFbPI/TDeRfuku+3CN2qHykwRb7aIxpH2FY2f0UsOJAL3anHdx7z2pMhzlDNUqIzTzCbI39qMHzihIe7dGi0JIREo85TRcckJWJgfvuSUUH72AR2lJe496VEdsIYh1GkMdqGyWhFAQQQQAAUMoIIACCCCAAggiQAaMIkAUAGgUEClYwkEEExAQQQQAEEEEABBBBAAQQQQAEbkNJQIACAC7Epp2SUAd0ALz4owUh2ETeaLEP6glBxKZynGnZCAOTmEqN3mO35JpxQgILy09oTsLFScspLiNAcOSU70CCmWn5MjPIpBQ2526UwnnhNjBKcHJKgoW0gp1nnPG3JMAKREQAgY6pFP6AOFCDsnCnQjDQFXpLOqdDXDNXxZab5RW17HXCj6uqihccCVpy1zQe/YKFWwVFDVy0tXTSwzxu0PikbhwPdhaT4IdW+LpVZSNPm1dFMxw79IDh9i9R3uxUNZWQ1dRQUss0bs9ZJEC7HrwvI5/EWSfZGcsKmcd6KOD3Wrh6i4wuAaJamtpXRQ5PyUXW6Xas9pW66ObZV9TLeq2rbLBJW1k1DA1uOqEkhGontOG7esqVxnFJD0d36kg8yamE7osDkQetYfrTPBNU6l4NskMmdYoo3PH5RGT9ZSw4VFpGij1VGokJOSQsRbfNvPEA7q8/2GrXtq2SNzndY+lOm/cQb860Efq2rtfhN0y1p92FB+U3E/Ax4JWcoiN7EOby9a2fR2MW+tH+nb/ZWPWy6PTiirj/pm/wBlN+DR5K+HKB/hopR/+Dwf2nLGcGu/xVRntFcPsC2vw5R/7ZaM/Ss8P9pywnCJLbPTeFcPsTj4W/DccTXPr7saWnsMDhSTyudKxp1yH6TvBN2Ox3S/iWsiqKZscTcTnrQxzM75weeylHiVnDvFtRV0tKJ65lTK17ZT8m6JwGB61lX01x4p4rrai20ElMJjqfFAS1jB3E8l5ubvGTr/AOSUX/EVubwzFROp/J7j5U5zo6mN+XyRjG5Z83uz2q1tV1pq6jqrfDSQAwuD+vrXaZIiexuNyQqG4Rs4QrqGKqq6WpheWsldEC8xAYLmE/VstPfeJ6LiAVL7nHBZKGXBpnMptIqwBzL/AJuQMJYM2RNfY6It2gdTWuWnqLgblVPaNUszjmJo5N22O3euayF0cpEsYxzJ7AByC0N7uFsZWSfEszmUUzWfJGUvLTjckntKqZSwNfK1xmYGEvYG5OO9dqk5TbMpUnorLq7yinMhDI2tbo0531ELnFSPlntxyK6BEyavlZBTQyTzzROLYmdsh5Z8Mdqy11goqNjqWF0c1y613lMh9FgHJjO/1reMlZS8KqWAi1sndnLpSAopjedwwlWdU50lrp6fToc1xdhVZdI12nURjmFcaspM1/DYJoYsjGyl3KIeT1QxuY/2JjhkE0MJPcrC6MHk9VJ3U5z7iolVlfRmOHnOfZJ6ePHWGpjeB3gDBUK7PzO9reQJVjwjG2S3TlwGWvGN+WVCrqfqqiemmPnRPIc4HIPbzVRolmg6I+AuJukriCLhzh2lY/S8TT1Mu0VO3lqefsA3K9W2r4G/DgpWG7cY3eerLfPNNBFHGD4BwJI9ZWx+BVwXTcMdDNFdOo0V19Plk7yPOMe4jHq07+1WPSR8IvgHgXjF/C9zFxqquDT5U+khD2QEjODkjJwQSApbA899J/wWeMeGo6i4cKVLeJqLScwhgjqox+byf7N/BZXoE6Ab7x7xVPTcV229WKyU0TjLUOh6qR0nJrG62keJ27F7u4I414X42tTblwzeKa4wEZcI3eezwc07tPrV3WVNPR0z6qrnjggjBc+SV4a1o7yTsEWxnif4Q3wd+BujHo3n4joL5famudUxU9LBUPiLHucd84aDs0OO3cuO9Gb8WiYEEYqZPZ8mug/DG6XKPpA4ppbDw/UCaw2dziJ28qidww54/JA2HrK550eEmjmxnedx/wDDKHdbCgcUNzUBw7VRsZmKtb2+SyH3BaG/Al7dXcqOlaDNWN76OUf1VMAM3T58icR2FHGCYi0DtyjoG6qN/wCcPsTrCGSBuNs7ro1RLIZGl+U81rpfSxgDKkNpg+Yg7hSmwMhIDWghJsEVojc9o81x7lLpqOUQObJhrTv4qT5odnGE8HjRuQAs2yiHHSx6/OGT4qEWBle9g2AUyepijfq159SgT1DTWOnaMgjbKSdgyWO7CBCiOqXhoIA3SfKZD3LSibJowlhV4nkOwOEeqYj0iUDsnamg7lIfPG3t3UNrJM5LijkjyclwASoB7ynLsAJEkzw4hNsa0PBa7O6Ev74U0hCxK5IMrx3JTR5oJTTjlyGArrn+CHWv8ETQMbpWluEJAF1r0sSP2ScDuRs5pgbjoPmdF0ucLS5xi5Rj35C96SMzMC17mOYTgtOOey+fnRfOYOkThx5zhtzgO354X0GZEyWocyQZGT2qJDehBbN+OVQ/pj7kR63tqZj/AEh9ylCmhx6H1lJfTQfyY95UE2Q3mX8Ym/SVHxNIymiZVTVr4wTpy6QDf2rQyU0GM9Xn2lcN+FlTauHuH3t1BraydhAJxkx5B+pAJEuosHRzJxDPf5Zo/jSd2qSoFfpcTjGdj3bKUYOCQ3e7SYG2PjU4/tLyW5rdR2BSNLfohV0Ks9nQwsds/OckJw0zByLk7FGC8EfSKlGPZWo2Q3RXmlY7tKIUbfpFT+rQ0I6i7EVlGztcUryNn0ne9StO3JDSU1ELIoo2Z9J3vT0dGwPDmudkeKfDMo3gtie4cw0ke5EopILKupr6KklcxrDNI09rvNykQ3+OTaSJjB2gBZouIDpHDJ180toD37doXzHI5+RTaR9Bx+HDomzWtnoZiDrDS7xUgUoxs8kdiykcZA55V5aK1zCI5XEs7z2Lq435G3UzDk8JJXEsPJG/SKAoxn0ipQGRkHIKNoXtxqStHkStOmRhSD6bkHUmPnuUvBROBIxuq6k2RYKRhqDHJO5jdIIdjKlC2UnbXy+yJB7B1zx3Bv2JxhcORR1QrY2LdT6sCtlx39UnW2qkDc/GEp8OpSsuPaj1O5ZKdILZHlooRs2Z58cYTJogT+/vA9SkuznmiA8UqTCzJ9J9pdU8HymF0j3QTxSEdzdWHH3Fc8sXD9Rd6rqKNvVRkHMjuQA5kd67fKxssL4XtDmPaWuB7QexVstHDQmgFPG2KJknVYaMDDm4H1hebzeBHkSTfiEzHcK8NQWi+3aJlTPIYupYHF2MgsydvWrSmnpZJZonTCGaB+mSOUgEdx8Qe9SoB/6zXpoO4dBnf8hVHFHD1JdblBqdLFO4DrJI3YIYNse0rXFjjij1gNPRvbbc7TVV7KWOvhklDA50bHgnHevP194frYOMKuw26nlqKo1TwxgG+kuyCe4YPNdws3CFjs1WKuho9FR1XVmQvJJB5qwioKWnr566KFoqZzmSXHnHbAGe5RyOO+RHqyGin4A4IpeGbURNM6e5VABqZWuw3b5jfyR9a1DaCEtOZZj4a0zqcTnKVHI7OMldODFHDFRQJDVTbYgctln/AE0UFIwPjb5RUNycHD1NeNQ5lRZAWVER7NRWz2y0yV8Xx/jNR+mlxWxkh2qpx63hExxLUe/YqESRZQBnyyX3hc7+Ee11s6Hrw3rS/wAqdFT5Pc6QE/UFvMuz6R965L8K6olZ0aUUQcdElzYHDv0tJSV2UeWnDHJNSHCcc7G5Tb8HfsWjLSIxGDlJJylvxkhNqSgckkjfKDigmkAy4YKae5wOyefzTEuyQiTSn5M+tOgqJDINOO1SGOJCBjiCIFGgAIIIIACCCCAAiRoIoAIIIkAGEEEByQAeERQygmAEEEEgCRokaAAggggAIIIBACmnASXZQ2REoEBrm8jzSm4x2JBAPMZQAA3AwnY2O6QjDR3BNEkDOSgJHdyBD2EDsOaS2XsIQ1MPrQAHFKY3AzlDYcmlE5xA5IHaDd4ph5AafWlF2OaafvgYSYwDknewJAGAlIJDHYE+3kmWeknNWEwHKduqQBTQTq2USkJwThSotySmgZ1D4MlWaXppsOCMyukjwfGMr2TcKmYxEjAPLkvB3RfXSWrpC4fuUJAfBcYTvywXBpHuK99XGJgc8Y21HHqXNyFscWcs6VLvU260XOMTOArraXMAA86WM6S3Pi1w9ymcPQT1Nit0zJpWsNMwBu2RgYx9Stekux0N14DuHlcQeaaMzxOHNrmkH7FN4RpoIrCyBjR1dNPLCPUHah9RC5Fp2EiPDC+MDMjvXlUNKzF5vTAST5WNz2/JtXPeJOk3iCruc7rPJHQ0sTy1kfVBxcAcZcT3p7o86Q2z8QVFJxIGRTV72mOpY3SwPAxpcOzOBuiPLhJ9TBzjdHTmscMc+SWE/M5jGZOBhQfLGOfgLqWyiSOa2HAGfI60f6Vv9lYpkhJ5rY8AvIp6wHtez7CiXhUTyr8OcY6Xracc7PF/beue8JuPxNDn8dH2Lonw7BjpWtEmedoYP67lznhM5srMdlWD9SqHhTLjiemq63pCr6WiglrGNeHPLGfveQM5PcE1TXKp4fqLrBT3aYawGNYPNdt2kdhS+Kau+U/G15prP1oE2l0nVNy7SQ3mewZRWOwWerir5b7f2UtxilBkikcNRbzPrd4di8/kTXapbQIojcbncaeClMvlMUUrpGMIydR55Wx4gudJVcCGK81VbJcKcsEFNTRtFOwdmo8+Sztzmo6eQVHD1YKWmfn5MkOmLR392e5P010ZZb5T3OXVc2N0zOjkaADJ9EjtCIRTx/8AGqBsgUTWMdUmlIfI2IOfEGkENPbv3J4vM8jmQuc3rYwwQs5vPd7Vt+PuNLdxP8vT8N0dukkgbEZRgEDHZhc7ZPJSTSVcI0GIaWEb42xlZ8XNPLfZUKUV6W9FV22wara/r6usnY5lY+k2dFnlEw+vmVc8MfBu6QOM5zV0Vlh4atbz5kt0mPWPB+doA1fYu+/BV6G6a0Wem424npetu1bGJKSnmbkU0Z3DiD888/DK9FYwu6Ma9H9Hi+f4GvEj2RuZxtaWvY0DT5HLjPrz+xcs6Ufg8dI/AtDLcKi2R3agY7L6q3OMoY3vc3AcB7F9JEl7GuaQ4BwIwQdwQtAo+eHQb0P8U9ItnqbhZau3U9JRTCB7aiVzXOcWg7YB23XRqn4L3H01NURmvsWZRgfuh+Md3oeteqeD+DrHwnU3WSx0raSK51IqpYWDDGyacEtHYDzwtD2pDPm10odF196MLvQ2a5ut8klwh6xvksji3GrTvkDtW/n+CZ0kVFO3q7jw4MjIzUSdv9Ba74bIbJ0l8NMc3Om3h3/jletab+Dx/mD7AqugPGdL0DfCGs9vZDS9IMMFFSxEMghu9Q1rGtGwaA3HsXAOHOFON+kXieZlnt9ffLjM7rKioc8uwT858jth7SvqbLG2RjmP3a4FpHgVRcDcIcP8E2CKx8O0EdJSRnJwMukcebnO5uKTdgeReDPgpdKNC4V8fGFt4frD+KzTGQeBczA+soukX4OHTnVW9/8A67t4pia3Pk0twma4+AEnmk+te2R4FGRlAHyT4i4fvvDd3mtN/tlVbq2HnDUM0uHq7x4habo1P7nlzzEx/wB25fQLpz6LLJ0m8KTUNVDFFdoWF1vrtI1xSdgJ7WE7ELwLwvR1dku9ytNwhMNXSV5gnjd8xzWuB+xF3oBviEnO7sYWp6OuhnpD4xEtRarDLBRzQPYysrT1MXnDmCd3ewFeiPg89CFCKeDjDjKhbUVMwElFQTsy2FvY94PNx5gdi9Hsjaxoa0BoAwABgAdyUV1EeJrX8DPi8UTW1fGVkp5SAXNjp5ZAD69lDvnwOOO6WAzWviayXGQb9W5skLj6icj617nQwq7MKPlpxx0e8b8A1Qi4rsFVRMLsMqA3VC/1PGyyktZMXFrI2kdhK+tN5tNuvNtnt11o4KyjnbplhmYHNcPUvB3wquhL/BvXR3/h6GSThqsl0adyaSQ7hhP0Tvg+xFhRwSWaYsDnYGe5dA6NehPpH6QY21Vksj4re7lW1r+phPqJ3d7AV0X4G3RJQ8eX+p4l4ipuustpkaxkDh5tRORnDu9rRgnxwveFPBFTwshgjbHFG0NYxjQGtA5ADsTbCjxLSfAt4sliDqvjKyU7yN2R0ssgHtyFDvXwMuOIKcy2ziixXB7eUT2SQE+okEL3QXAc0YPNK2M+U3SF0b8Z8A1gpeK7FU0AccRTenDJ+a8bFZItwV9cOLeHLNxVYqmyX6ghrqCpYWyRSDOPEHsI7CF80/hCdG9R0X9I1VYC+SW3ytFRb53jeSFxwAfFpBB9SpSFRz6QBoaQlxkkJsnLBnsS4jkZyqELccDZMucTzKdk5JggFAC4tnj1pcv784eKRHzGEuUfK570wFO9DAUbOCpPNvrSTSygatOR4FIBLOWUpJMcjdtOEoNfhOwaANyj5EbpJDkprSQgEi84Ff1fGljk7G3GnJ/WNX0UgP7sPiSvnBw4THxDbZPoVkLvc9q+jtOcVLSO3f3hRICYmnFKPNJcshDU3orjfwpmtPANqe7m27AcuwxOXY5uS5P8JmJsnRg2QjJiukBHhkOCf2CPIT/SPrSUuXAkd60gLex/R7cp99JUk4TFMANJ8FIKqLMxB2xhHzRdpRqiGwwNkYBQbyRgoBMA2Sw0OGDyIwkJbSk1ehp7MO1rWuqaZ489ryD7Ck09OWSblTuIaZ0N5klY0fLNEg8T2qM2V0rDJDGS4fNPNfD8+Lx52j6viT7Yk0Smt0tAwlRnBCS5j6imIicWPxkFJiEgiAmGHjmuN5q8OmrL21VRY8QyHLTy8FbYCytBOASHnzs7LRUU3Wx6XHzh9a978T+QTfxyZ5H5DhtLvEkIYzskk95DQOZJwAuOdIPTSynrn2Xg2KGqqmuLX1su8YPboHbjvX0lo8RWztMrNMr3Ow0EgZPqRsbqGpvnDvG68e3niHiO+zPqa/iCvqXN86TTIWNb2bAYSrNf+I7LK2stHEFdFoOdL5C5p9YPNK0h9T2AO4JLyG9i5P0YdMMd5q4rPxNHBSVkhDIqxhxFK7sDh80n3LqNU5wcQmnYNNCJZfOwETXEnmmRue1PMGybRKHWHHNJq2MnpzG8nmHA9xByCiOUhzsDwSpAcF6V4brD0g1IbNWyuqGMnjMWoeHId3Jarozv1bWdZSXgTuqGhghlkYQXNacFpPeD71ccd1z7NxFaruyB0+qN1IY2jclx80+w4VropbVYWVNwdiOkj66Z/bnOT9ZXm9HHLaYkzcyOGrGexJ808ua893/pa4lr7jJUWiVlDRZHUxGMElo7ye9dG6L+M5uJ7VKayMRXCkcGzBow14IyHDuWq5UXLqGjfBmybkBac9ifhdqjDu8I5G55LqSGtApn6hgoqpoM0HrP2JqLLX7KS4hz488wCmh0KZ6KPfKA5bIKxMHNch+FkAOjm35c0YujcDO58xy69uOQXnn4Xt2kkunD9jGeqhp5Kx473PdoafYGn3oBHBXuATT3Z5JT02TzVGw0/nlISnolIDbkWod6Wm3jBRsLCfhMyDZO5yCm3c0WwGhsQpcWMbqHICRshG6cnAzhFgTC86wG4wnCRnmmoI9Ay47owcvQVoeQQQQIBQR+1JOAgYaCLKS53cgQtEiDtt0rIISEBBBBMYBhAoIkAGgghhAAQQQQAEEEEABKghlnmbFBE+WRxw1rG5JPqCSt50K1EVLxFNUPDesbHhhI5ZO+FE5dY2aYYfJNR/sr29HHGrqI1fxDUBgbqw5zQ7H5ucrKVEUtPM6CeJ8MrTgskaWkH1Fesqa8N06i46j4qpv1v4Y4mnDeIrPBVY2EzRokH9ILgjzk3tHtZPwzjC4u2eYMo27heoouhno1rbe5lFS1bJXt2kFQS6M9+CuO9IvRbxDwpVTTU1NLcrUHeZURNy5o/KA3W8eQm6PMlxMkU7MAglO5luNxzCTg9y6Ezkaa9CLQUQa7PNKRhWKgiXBEScHKWRlNu5FADTz5wQZntSZPTCU3tQMcySEocklqWgADYpQGo7JKch2RYqJERwzAUhhIYVGj5qQ30URdAy44TLvwht2k+d5XCW+vW1fRGsIfnt3Xzn4fM3xtSCnOJuvj6v8AO1jH1r6G62uZE1s0cjy0agx4dvjfkVjn0JOiv4qZnhK7x4yHUM239AlZe33WpoaSphoYxUV1VR0lTSwuOGmSSDDifDzMlbW9Q67LXRkbOpZQR/Qcuc9HENNdqqbiOCczxxW2kt0RB81rmRgyEeO4HvXI1/QPZ5+lbWU9TNHWa4qgyudKxzdOHEkkY9ahVjmDIe4DPivUV/tNDWOLqqhp5nj5z4wT71j+HbHaxxLfYjbqU9XPGGAxA4BYDt7Vwvgtz7Wc8sOyNwRxS+98H0QnkD6yFzqeVw5u08nH1ghaOkDydwVMt9ktdNcppoKGCJz2NB0M0jI7cDtVoYYmjZoXqYo9VTNUtEKEOWy6P89TW+D2fYVmAxoPJafgLIdXgcvkz9qt+FQWzy58O0H/AAoWc9nxU3+25c14RI+JT3eVt+xdJ+Hcf/ajZAOXxO0+3rHLmfCZHxG7H4037EI0ekXvFVe6n4hv9Ka6WhjqZIiZIWZe7AaQ3PYEjiyusd14VppPiJ9HdI5+qhmjeNMsY9JzxzLimeLJqOm4vulTcKKWqaWtELWP04dobue9Zfr2VOp75Xtdk4by0rhyYe8yLJNPFBDCyYytfJqwY3Mxt3pdwdLJI5tMDoA7BlVpjkLmlz5DqOwZuSrK2uqoxNU0Uwp3jDRq850mdsNC6Wuq0CLebiKZ9pFsp6CCnpnACQY1Oee0lx3HsV10IcPRcY9J1kscrdVI+p66oaORjjGpwPrwB7VnbRbKy4W2rmlPVR0kjWvc9wa/J7MLrvwKaWF3S9WPaAWwW2V0TjzyXsbt7Cs8Ti5f7BntCNrWsDWtDWgYAA2A7kxda+ktdtqbjXzsp6WmidLNK84axrRkkqSFxf4ZVe+i6EauATugZXVtPTyub/J6i9w9RDFvJ0rKOI9K3ws+LJeIJaHgGgoqG2xuwyqq4eumn/KDSdLR4blQ+AvhccY2y9wxca0lHd7VI/TLLTwCGeEfSAadLsd2AuEPdQvfVXB8roqaNuYg8ec7u2CzDpHSwuIbnUcnwUwl2B6Prhw5ebdxDYqO9WmpbU0NZEJYZG/Oafs9Sn9q89fAMutTW9EFRb55HPbb690cWfmtc0OwPaT716GWgHkb4amT0ocOj/8ADB/vyvWtL/B4/wAwfYvJHw0pmN6WuGoHZ1SWsaTjb9/K9b038Hj/ADB9iAHF5M+EN8Ja72biir4W4EFNEKJxiqblKwSF0g9JsbTtgcsntXq2ve6Kinlb6TI3OHrAK+T90nkqqt9TMcyTZlee8uJJ+1C2B2jhn4TnSpariyor7pT3umDgZKWppY2Bw7g5gBafevbPRpxjbOO+DaDiW1FzYapp1xPPnRSDZzD4gr5d0rcnGcL238AiaV3R1fKZ7y6OK65YM8tUbSU2qA9HFeXeKOjumufww2xGma6hrYILxVMLctd1YLXA/nODV6iPJYSmpYn9O9bVloMsfDkMYPg6oeT9gSA3LA0NAAAA2AA5Kp404jtXCXDFfxDeqgU9DRRGSV/M+AA7STsArheav+UEuU9L0W2q3Rvc2KtuXyoB2cGMLgD4ZKAON8b/AAuekW7XmU8KihsVsa8iFrqZs8zm9he5+2T3ALadCHwsbnU36msvSRHSOpqqQRR3Oni6sxvOw6xg2x4jGF49ojh5B9mVLcGuh2IB1e9Ov6E3R9e2Oa9gc1wc0jIIOQQqPj/hqg4w4PufDdyYHU9fTuiJI9Bx9Fw8QcFUHwfLtUXvoV4RuVW/XNNa4tbs5yWjTn+qt27kkM4n8DC2OsvQ6+1zs0VlLea2CrGN+sZJoP1ALth9a8v8D9K9p4C+Efx3wHxBMyitNzu3ldHVPdiOGd8bC5rj2Bx7e9enYpGSxtkjc17HAOa5pyCO8HtQB8+Phh1HSPB0sXZ18lu8dlEubUY3vFMIcDGnT5urnnO+U58Fnp6uHBfE8dp4vv8AVT8K1LHNeal75jRvAy1zOZDTjBA78r3/AF1HS11O6nraaGphcMOjljD2n2Fcy4v+D70TcTan1fCdLRzuOeuoCad+f6O31IAgD4TXQpjfjRnto5/7i89fDU6SujXpEsFgm4TvjLjdKCqka8NppIyIXt33c0cnNbsrDpX+B3caGnqLj0fXl1wjYC9turcNmI7mPGzj4EBeVLhQ1dsrp6Gup5YKqB5jlieMOY4cwR2EFOPoMT83klxbb9iQDmNvenB6IWhIcm4Tek9icJyEbTsnQrGmHBTzxlupNO5o3EhvNAwy7I25IZOOZRMGdkeMO32RQ0HqdjmUWo95S5vNaPOBB5BNh/e0FIqwAnvSg443RZbj0frSm4LctPsQFok254jraeQkgNlYf6wX0gpHh/k7wc6mMPvaF82oHYexxxgOB+tfRqyydZbbdJ9KCE/1AkxSVFw7mklG87lJWRA3LyXMvhEsL+ia5OAzoqqZ3/iY/aumy8lg+m+FlR0VXyN/LTE73SNQho8TVAAqJB3OP2pCdqTG6okcDzcT9abwPpfUtmgR7YbK1oGl7eQ7Uo1J+k33qaKSjAwKeL3I/JqTO0MfuTpmf0QPKSO1p9qHlJ7grEU9NjeFnuQ8mpf5JiexEBtQ7wTjZz24U0QU2dom4Supp/5NoTsdEMTEjlhKEpA5BSxFTj5jUicxtjJYwBJsPSj4nYX0sNUB50L8H1FVuBHPHURDzXbkePatdJTU9VTyQub6bdJ+9Y+hBa6ail9ONxbv3hfM/nMG1kR7n4vLpwZYVIDdNRF6J32SKqPrB1gB5JdvIcx1K/2J2mZ5xiO++y+Zbs9nwpZZOpeMd6t7fWayHNJ1Dn3YVdd6cseThQqed0UgIOB27rCOSWKdo16LJGmWPShxC20cIzdS1r6quBp4WnluN3ewLz/xJYaHh3h2hrYKcNqJKgxve45cQY3Fd04ts/x/Z4JNOqakk62IDtHaFy7pzjFNw1ZWAYMtTK/Hg2PH7V9z+M5v8jGl9o+X5vF+Gf8Ao57SULhSQO1EulZqwolVWCmpnxFhc8lwx3YT1HWuYYiTswAAJVNStuFT1bGEvqatkLf6T2j9q9itHA3s6VdeD7DaamgD7ZG/XHG98hc7UCWg55967JwpdHXKzMExHlFKRBL4kDzXe0YKzfTrZ5bXcRAW7xRNYP6IASejSqikr6briS2uhMROcfKMGR7xkLljNqVFtWjeayN8ICfHMJ2SjpgN9XvUV1LTZ80vP9JdfYxBU10UMTpZpGRRsGXPe7DR6yqal4v4drKs0kF1p3TZxjkCfArmnTncZzf4rJDJK2lggZK9pOz3uyc+wLN8MWG63iR7rdTgtjBLp37MaQM4B71wZuY4T6pESk7Ow8fTRQ0dJXvc0spalrpO3SMjdSeIcVtBStZIDSz1EPWs05ErHOG3qXNeHeDL1d2eW3S4PjhlaAGFxJc31clOrbb5GI6BlbWitZUBpAkOgMGCHAdmdlPySb7NDTOj3CwWOpe6KW0Ujmaj5phAx6kxw1wpTWC7V9TbwW0lXFGGxZzoc0nI9SznD0l5Eoa6+VenURiRokB966DbIajyZoqavU/tLGaQrjGEpXRRaULyIwD2KQZNjsotNSNcT+65x6ipIoMneqnx+cF1iGtQDk4JcytGDs0nkod5fbrPSmruV18khHzpZAM+ocyucXzpWo43ugsVNLUkbdfUuw31ho3USyKPp0YuPPK/1R1phJGcH3In1FPFkTVEMePpvAXmy98dcRV0rhPdZmsd8yE6G/UqWS6PlbmczyHvc8lck/yCj4j0sf4eUlcnR6pdcaJsMs0dRBP1Ubn6GStJdpGcBeJeOeIrjxRxDNd7vPK6pkyGskGBEwE4YB2AZWsZcmMkD4pZY3DbZ2CEzV1UdQNE5imYTuJWhymP5P8A0av8NXkjm7yCo8jsHC6FcuF7XXxl9BIKKc7gDeJ3s5j2LE3u2Vlqq/J62HQ4jU1w3a8d4PauvDy45NHDn4k8XpAQSXE9iIk43XUcoeQmnOJKVlIKGxCQkP7Up5xyTecgoAQeYUqMta3Kiu3StRwgGPvlB5EIg8Z2KYGScJ0NA9aAH2yeah1iYJDQgH5KAJLTnbIRE8wm2Zz4IHmkAtJJ2RIZTGKjzlPJqIdqdQAEWUEXakxWGUN0SMetAwxzRkokEwAggggAIIIIACk2yvlt9SJonlp5H1KKU3NySkrVFQm4yTR1vhXittTGxkszQ4d55rYRXGAgHrBn1rznDUSwvDo3Fp8FfW3iusgIZK8uHLdebl4n3E93i/kmlUj0HQ3vqcBsm3gVorZenVB+U89pHauG2K801c0GKqy8c2k4XQuHrnG2JjZHBu2NyuSSlA9FShmRd8RdHXB/FJdNNTm31bhjrqU4ye8hcn6Qehy98OUE10t9Q260MW8hY3EjG95HcuzUtSdAkjdkd4WitFV5ZC6N8etjmljmkZBBHatcPIkns4c/Ei0eKOYyEWV1LpH6JOJaPiypHDljqay2zu6yExYOjPNp9RWcuHRpx3b6Q1dZwzXRQgbuLQfqyvUjmTR4uTBKL0ZHOxTUh5J6ZronmORrmOBwQRghR5OatS7LRi4OPoh3pbpTeabdnUlsO6fhA6zmlptp3S8pjDSmOwkoDmkDJcWMZTuSSNIJUds2kbNBS2TEnHL1JoGWNICyRj9egtOQQcEHsXQrFc6x1NS18VbPDORqD2PIOQcA/UuYxuII3K7BwXwPxDxDwbb7pZKaGogIdA5okDXRvaSNwezfOVx86MpY/wBfTHJFtaO29HXSHW3jgi/UV5n624W+3ySx1GN5YywjJ8QVbdDkVNbOi6zxRN0CZrqg7c9Z7fYstbeGqHh7opucrWSPrqu1P8plc7ODg5aPDIWr4OpNHCNnhAIayjj2/ormwKSSUghdbLirqWvzhowsfZ5v/XC/vA5vhz+gtbNCAwgBY+ztDeL78zvdAf6hXTRoaSmlJmkcfBPOeVEpSfOPinjyWqJFF61HADiTX7/yf7Vk91quj3JNf/3Y+1DGtHl34drh/hQsuncfE7ff1rlzLhV2LK8Y2FQw7eorbfCxinl4vmqZ3lxpa+WmYT9Bx1Aew5WG4VyLNKe+oZ9hWeGfe/8AQ5Ox3pJe8cW1hBJZ8ngf0Gqvhgikp2Pxh5jz9auekmmkN7qp2Ny3TGT69DVVQTxts8bmkF+C13geabSTJoKF84D6KkhadfpyHmPBHBUSufBGwAdW46Md7e1Rqd0rWzOZJpfgH1hKotbKikY/ADmOLiT3lEloGXtruQpJZ6nRFPUyghxeNWk9/cuofA8ubaXprjppXn93UM8W+3njDwMf0SuYimtpD4qJwe+OLrp3vOAMHYDvKf4UvE/D3HNnvlBMHVNPXRygnkRnDgfW0kLDGkpaC9n0kByFzb4SvBdx486IbrYbQIjcC6OenEjtIc5jgSM9mW6gt9aK+ludtguFFK2WnqIxJG9vIgqU7lhdDVo0PljxzwpcuGLlHQ3Gohkc1ge9sALmgnsJWeIZFOXxsOl3zcd6+mvHPRfw7xVIyaYz0U7QRrpwzDgeeWuBCzPB/wAHfo84fv0V8mpam7V0L9cRrHgxsd9IMAAz61lCMosboR8EHhCs4U6H6R1yp3U9bc5XVj4nDDmNIAYCO/Az7V2RJbgDAAAHYlBatiPIXw1YGTdLHDb3A647Y0sIPL90Feuab94j/MH2LyH8NarZT9MXCsL2vPX20NGkZwRUHn3L15T/ALxH+aPsTsBq6/5Mqv8AUv8A7JXybccsgP8Ao8fWvrJdP8m1P+pf/ZK+TQ3p4D+QftKEA7Tjzs5wva/wBiDwFxAe340H+6avE7chuQvaf/J+Eno+4hz/ADqP901UwPS65u26Mp/hHutcjgDV8MNfGM8yyodke4ldIXlb4S3FFVwb8I3hfiGlBJpLWwvaB6bHVBa9vtaSpA9UjkuB/Dl4UreI+hs11BA6eezVQq3xtGSYi0teR6sg+xdws9xpLrbKe40EzZ6aoYHxvacggqVLGyWN0crGvY4FrmuGQQewhAHx5iHneac7bHvVvZLbV3app7db6d9TWVUzYYImDLnuccABe8ONfgm9Gl+u81yt77lYZJn65IqKRpiz26WuB0+zZa/oj6CuAujao8utNJPW3PBAra14fIwHnpAADfYMqmwNd0Y8Pfgn0e2HhvVqdbqGKB573BvnfXlaF47O9KIwFzD4SnSRTdHHRrW1rJ2fG9ax1NbYtXnGVwxr9TQck+AU2B4j6fbNxHxH0zcV3qh4du09JU3B/UyR0cjmvY3DAQQMEHSnujrjzp26PmsgscPEMlvjP8BrLdLPAB3NDm5b7CF7S+C3xnDxn0OWaodP1lfQRCirWk+cJGDAJ/ObgrqePH60+wHjLhX4aVwhmbT8W8FROLHaZZKCcsc0jn5j+3wyvQXRL03cAdJc3kdgub4rmGF7qCrj6ubA5lo5OA8CuF9OnwTLpeuLa7iPgK42+OOvldPNb6x7o9EjjlxY8AjBO+Dyyp/wZvgz8S8D8f0vGHF1zoGvoWv8npKKR0hc9zdOXOIAAAJ2SA9YfNXjj/lCOA6CkZaOkGgp2QVM8xobg5ox1pLcxvPj5pGe7C9jg7LzF/yiF5pIOi6zWNz2mrrro2aNmd9ETHaj73AJoDwo3I3z2pReU2MgaSjC1RLHGuS2ZdhoGSTsmm81Oaxjahvk7g/lgnllDAYLHavROybmyCFZV8M1LcqmkqABLHIWu9ar6n0wAkAIzgZS3edgd6Q0YG6URgNcDzKYkL6gnm4pL4iw7HOVLCaqThuUhkVzX5xpKXCHAn1JBe7UTkpUBJec9yBg/i3b9i+ivCT+t4YssoOdVDTnP9Bq+dY9F3qK+g/RtMZujvhuY83WynP9QKWN+Gvf6RSexKdvum3E9izIEyciVjOliPreji/M/wCrh3ue0rYvOVmekKPreBr8zvoZD7t0L0Z4QnGJXj8o/akA9ierW4rJmnskcPrKhVpcyme5pwV0fQI95IIIyEzMIlFnCBG6BCADyUZ3CIDZKQISAUU/72M8icJaTOD1bO7UpkAuN2HLPcUU7qa4Q3OJuGSnTJ4O71fsxqPrSLhSsraGWlf88eae5w5Fc3JwrNicWdHHyvHkTKRhaJo6hnoO+pSKk9W8SNPblVtqc8tlophiSMnn3hWMeZqZzSBrbyXweTG8c3Fn1UZdkmg7tCJ6QSs323wsnVtdHIe5a2jk+RdC8c+SpbnT+c4Y37Fy5ofaOjFKtB2Sue0hmvAXO/hVspqeHh2OlfqjfE+T1OI84e9bCkLophnmCqPp2sxvPR+25RM11Ftk60Ac+rOz/dsV3/h+X8Gbq/s5vyXH+WGjz+w4jyN1oOBJ2RcSWF8rcs+NqYuHeOtaswZC2FXHBxL+IrCBsfL4Xe52f2L72M7ifKSjUqPWXT8fLbjVyt3GXY9y5pwTM/yBxYSJKWQTx4728/qXRukUGa1QTOBJme/J/orn/B9MYX1DJAMEAewhcuSX7FRWjoPE/FFvs1I2SZ5lnljMkUDD5zm4zk9wWb4P4gvXEdb5XIxtJbm581jfSPYNR5+Kz1RYLnLxkBc4pJKCpIpTLnIa1u4b4ZxhdKpqeKngZDDG1kbRhrQNgEQlPJOvo56aZkOkrhqmu92tVzkc9rNfUVbmDJ6sbg/s9q09C23RWGUWgweTRQPAEZ2GGnn4qaFieJ7DIWXW62Z8tNO2fRNHE8tZJGGgO25Z7VrPGo/tRMrLrhkGCgioXEnRC2SInm6N33E4UB1NDWcT3GrGHaHQ049Y3Ko+Eaq8zWCsrqmq0wW/ahmcNzgEOb4gnCv+HKKthttOytfG6aoqGTOcwYOXbkFYxyd9UKOy+tttjhmLiwF2okeG6vGE8slM0TATnvKnGncSCAt1FI1SFUznB4aMnKxnSJ0p0HDsD6K16K+57g7/ACcPr7z4LNdLXSMy3umsNgnBqBllVVM5M7Cxp7+8ric7pnuLiXOyeZO6583JUdI9Thfj3lfZ+FpxBxLdb5XOrbpWyVMzjsHHzW+AHYokU0jtySPBN0lICAXDclWLaKNoac7ledLM5n0MOOsS/VEXW87g7qQ2SQtAJ5jkleT7nAReTvHM7KGCI8sbc55d6gVGoSkDkrnqSct052Ve2nfPViNgGXHG6Uaj6Npsk0pcaVrmk7KTJNR19EbddIeuhIw0/OYfpNPYUhkQpIZaeQedgFQbtFLA9tRHjRgEbrJyqdxLWNTj1kY/iK0VFmrDFI7rInjVDKBs9v3qr17brpk1NT32zOopCGl4zC4/xcnZ7DyK5lPBPTyOiqInxPY4tc1wxgjmvc4fI7xpnznP4nxSuPgXWJDnDmjwElzO44Xa6Z5oTnAjCSATyRkY2PNDOGFw7EXQwjGSgGOWy6O+AbnxdMJ+sbS29hy6V3N/g1dapOhrhWFgbUuqp39rhMQFjPOoujphxZTVnnZjcFG87rv966IOHJInfF5qKZ4bsXSFwyuV8V8C3qxOc90JqIAdpI2k7eKUeRFsc+LOKsyLuSONpcUsjSSHbEdikUFLVVTw2mp5ZnE4AjYSVupJo53CSfg36Iwk6gSVNuNqudCAa2hqacHtkjICgYwTlHb+hNNC0OZwkkpTPSCpCHmNwEo8kQ5IjyQAEEQRnHYj6FQEY5ou1Ac0gQoIIBAqhgQQRFIAZ3RkpKUknYgikubqCUUQQwGJGED1JnJKmEAnKakjGeQQkFiIZpYJWyxSOY5pyCOa7JwLVsulthnm1Fzhpdp7CuNli6d0JXEwR1FC8BwDtQz4hcfJxLrZ6PBzuM6Oo2181tGqnkdIx3zH7rYWLiF8nmdUyFw3wNsrFMrGCqaCMDxT9Xcm00zZAAB3ryVpn0jcZI6i68tMIc1wB8DhLpL/AK2OjmIe0jGHbrlZ4gMgw2QY9ak0N1LnZ17LZZGjkyYIvwzPTvwE2vMt+sVGC/05mRjcnvwvP0moZa9pY9pw5pGCCvXMd1LpdIOcjGx5rz9042mKh4pNfThrI6kZc0bYcu7j5V4eVy+O6tGF1DPJG3nlNgg7hLau1tHmdWOAbhKB3wlRQzyfvcEj/wA1hKtKHhq/VhAp7VUuzyJZgfWhzikV0bekVeUYC1tH0b8VVDcyUsFMO+SUfYFdUPRdO1wNdc247Wwx/tKxlyIR+zSPGyy+jnsbdXLsUingkkd8mxzzy2GV1eg4GsdG0B0D6h/0pXfsVzTWalg82npo4x+S3C55c6H0dMfx8/s5bZ+HLjXEfJuiBB3cF7d4AtNqs/AVlorRB1NL5OyU5OXOe4AucT2nK4NS0giHmgA967r0aVXlHAdvY4kug1wn+i44+pRDk/LKhcnirFGyi41p2O4F4koZpJGy2+CaWMRnTrjcC9hPeNyD6lqOEqYM4StBIPm0MJcSeWWAqi6T7XWVPD10q7fPFFJ8XTQ1DZG+bJFjV2doIyFjuk6/VdN0f8NWyOuIjuNAJ5JYxoL2Na1rWfWSVT/V2ebNqJpeK+kPhOzzOp5LiKqZvpMphr0+BKyHBnGlsvnHNbBS01Ux1cxr4zIAMCNuDlchrTSxjqqYBzj6WFsOgy3SycWVN0eAIqOkLGnPN8hx9gKxjncpUkc6zXKqO30xAiz4pQnaTjkmqQgx6fBMysLZMr0I7NyaHgrU9H7hquAx2Rn+0sbHla7o8zrrx4R/a5D8Gts8y/Cxha+vvMn8ncgR7SAuYcINMlsfGAfOqI9vYV1P4Uro5JOIXg5zXjHr1Bcw4K+TslXUnk14a3xOFx8TIv3/AOxN7o2l4oYq11R11OHGRjPP5YAYFlbk23tgdHBBG1oxnA5LScUzOgBl60hpgZhgP5AWDuEzAXBrgXObggLardlPwKobF8YhsDgQ9gAHsSaGGU1rBPyyWqG4y01bDUOYSI2AkZVtW1bevjcyPzdWS7swtJLRC2OwQRyeUkRudNgBhB5Kue6aObXqLdLm6cdhyrmwVBgqXXHS1+okCLs0nvUKeMSVoEuzZZR6PiexRFV4NHZuiXp+ruAKuG38Vy1NysdXIGa2tHWUhA9Jo7W949y9ecI8WcOcW2yO5cO3ikuVM9ucwyAlv5zeYPrXzn6ZYKSKjtjqZ4y8uD2kYLSBjdYG1XO5WmrbV2u4VdDUNORJTzOjd7wUYm5LZofXFZXpD6QOEuA7RJcOJrxT0TQ0lkJcDLKe5jBuSV82n9KfSa6IxO4+4jMZGNPl7/vWWuFbcLjUmpuFbU1k5OTJPKXu95OVsogfRz4OXSnUdK1NxNdzRGjoaS5Np6GF3piLqwcu/KJ3XXByXyJortd7ex7KC5VtIx5y5sFQ+MOPedJGVMZxJxIWhzeIruHDnmvl5fpJOIWenfhzVL6bpn4Mcw7Pt+hw7/l8r2TTn5CPn6A+xfI+K6XCvu9NNcK2prDG8YdPK6QgZzsSVqajiy9tuEp+OLqYnEljTWSDA/SR1A+oVzI+L6nOw6l+SfzSvkzSHrKBuBvE5zPXuUq5cScR+WyM/CC7Bn0fLZMe7UmbZ1slIYafSZC/OCUJUBKaHiOQadm8/Bezv+T2eH9HnEWOy7D/AHTV4nlFXTOeypa5peO3tTVHdrrb43x266V1Ix7tTmwVD4wT3kNITaA+vGfWvG3w3N+le0nsFmYf/wC5C8sR8T8Sgg/hFeMj/r0v95XlludddnyT19VNUzQxNYHSyF506x2kqXoD0r0ZdLFx6Pqs0VbDJXWOaTW+EHz4SebmftHavS3BPSBwjxjTNmsF7pal5HnU5eGzMPcWHdeL+MaJ0VHrcMZC49c5pYal08EskMzTtJG8tcPUQpi7dA9H1Zz/AOcInvaxpe8hrQMknYBfKqi6UekW3sFNQcc8QwRNGAxtfJgD2lO1PSBxje4m0t54qvNayaQNcZ617g0HblnBWnUVnvXpc+EDwBwBTTw/GUV4u7RhlBRPDyHfluGzR9a8G9LPSLxB0kcTvv8Af5gXAFlNTM/e6aPOzWj7T2rL3enFLWS05eHOjeWuIHMhRgS4ZG+EJDOi9BnSjfejDigXO2ZqKGfDa6hccMnaO3wcOwr3t0ZdMnAnH9HG+1XiKmrXDz6GrIimYe7B2d6wvmVHUBjnOLclw7E62dzw3q3ljuwg4ITasVn1zG+MbhKyvlNbukHj+0xGC18aX+jjG2iKvkAHsym7n0ldIdwgdBXcccQzscMFj6+TBHsKXVjs+jPSn0x8BdHdBLLe71BLWtB6ugpniSeQ92B6PrOF88um3pKvHShxtNxDcx1MLW9VRUjXZbTxZ9Ed5PMntKxEkskr3PleZHuOXOccknxJSDlNRE2KO++N0QGEaCtEgHNPx50P0nznN0t9aYyFLpoyyqjBHZqwigRa8TyirvIrm4zUQROfj6YaGu+sKrkjaXZKnup3T0UszCP3O4ah4O5FQzg7Z3UNjGHc8JLz5jW/RKdlADcpoDUU7tATWnzB4hM1XoD1o4S7GHHkNkmoJxhMCINnFOwnMhGOxJABBSqYee93YBunQ0KAy0+1e+uh2byjoo4VlyN7ZEPdsvA8Z3AXuvoElEvQvws8YOKLT7nuChlSOjZzhFgHKMjZp8ERWbIobl5Ki4oaJeHbrFj06KYf1Cr2RVF2jMlFWR4yX08jfewoXomeBrl5tfUN7pXff+1QqppkgfGMZcNsqde2kXerB2PWfsCh48Vu9DR7wahpx2Kq+PbY3H+Maf8ASRHiG1ZwbjD7EuxHUtkFU/H9p/nCH3pxl4tjm5bX05/pqrCiyR4VY692tp86vh/SROv9q/nCH3osKLRIqTiNo73BVgv1pLv8owe0pye72x76YCthI1HOHctlPaxUWMfeljmoAulv3xXQfphKFzoc/wANg/TCArZW8RwGnrI7hCMCQ6ZMd/ejjkDSydvov5qbV1dvqaSSF9XBpcPpjmqO2zB8ckHWB2k5aQea+X/N8dRl8kT3/wAZmco9WWFQeql1tPmndRri3WBK3kU/q66kLc+c1IpyJaZ0R5jkvnZbPXj6UMrD12R2qdBFDVUs1FUt1QzRmN47CCMFN1keCHDs5pyk337VzxuM00bOpRpnk7iy3SWbiCutUmQaaZzBnu7Pqwp/BcrY+IbRI8jEc7X+7JWz+EtZeovtBfYm4bWRGOYgfPZ94WF4Wa03WjL9mtje8+wFfofAzLJgTPkubj65Wet+L6iOq4St0rXgkyj3OYVj7KwtpjNjdzR9WQrSulH4G2trhvrh37vNKr7Q/NLE3PPUP6xVTWzGPhpceVw1EIdiVxbLE7sDwAce8fWp8ErKiPWBpc3Z7Dzae4qmoKyjhM0dTURxk4Ldbse0IG7UDKxsnxhTh+MOeH56wdx9Xeto/rswki9wcJmkawsvEEwGkTlx8WuaD96rX8S0YkdHTS073A7ufJhuO/xVFxNdoHsMxvsIMmiOaCBmzmA9/NOeTWiOrGbIx9fPVWekZi1U1e+cyj0ZQcEMb4B2c+pbBrdVXRMA264Z9yoqO+WOlpIoqWojZHjLQ0YVjYLrQ3S+0lNTTh72OLyO4YRCKirGkaykiAw1vZssb0y8Zv4ftjLJa3uN2rYyS5gy6CLlq8CeQ96Vxf0g2zhyd9LTaayuaDlgPmx+vx8FyC636tu92qLhUvDp5zlzsdnYPUs8uRVo6+PhuVtGY+K7jPK7NPNuc5I5qdFRzQREzMLS3vCtIKySM4D+feVMFa2RumRoc07HZeXlg5bs+gw8lY6SRn6ctcHbb52UqKmLu3fsUuWljp9UzGlzXEAAfNUu3wdaR34WOPHT2eg80ZxtApLYXxA6CSU/8Uhu7gdwr1rmQ04Y3GwG6jTTN87Uc7LeSSOeLbZQy0nUPcW9o32VLUQGKQzMOlzStBd64deGMG2jdU1QA8E9i5ZSOyK0QpHPlc579yRjKjVTnPi6p/LsU4ObHlhA84YCjz00j2a2tJycbBYvTstRIlscY3viYd/TaPELbUtNQXy2x1E9LDM4jTIXNGchYNpMNYx/aCAQtfwdVRQ0lwpXO0ubKHszywdiujFJ/RzZsalpkOv4D4eqCcUz6c/6J5Coa7gG2sceprKlvtBW6nqW41B4OVS8TVpsvUOucE0DahpdDqYcPA54XfCeQ8vNiww1Rh6vg1kR8yuLu7U1N2Dgq4Xa9x0MGOrB1SSjk0LQ2apqeI7k2is9FJPIebseYzxcewLsfB3DUFgpiJXdbUv3keOXqC2eaVUzljgjPwcsVFDZLTBbqUAMhZpyBjPirWKoa4DKbr2NLNY2KzxuIjqjG52PBceSTbPSxw6xpGklnafN0ghR5KdkzSHsaWnmCEzRTRzb53VtGxuBhJSLcVWzD1HR9wxLdjcKq2xyEnOnkM+pai1U1qoYhFQUVNA0fRYArCSNhBDgCqO6RyU51wAlvaFXyy/smOCD+i4qqejr6Z1PWU8VRE8Yc2RoIXMuL+iC01r3T2OZ1BMd+qd50Z+5a6hu+h4ZM7HrVvHX0zx++tx61Uc8l9inxYs81X/gHiWzkumoDNEPnwecMermsyGPjlLHsc1w5tcMEL2C59K/lKwFZTiXhDhy8TCSp0MkG5dGME+tdcOZXpwZPxvZ/qebhjHNJK7fJ0W8OOcdM8hH5ywfHHBbbEXPp5i+LO2obrpx8mEtHPk/HZYLs0YsowiRhdJ570wxzSkQRnmkAEEEEIAIkaCACHNGggktAEUXYlJJ2TYmAHbCIhAHZHlCQCO1aLo0uTLdxMBNsyYad+9Z04yiilMc7JGHDmnIKzyRtG2GfWSZ6OuNPHNSiaF2l2MhZ6rrnaTDKTnxRcPXR1bZYXl+fNGTnmhUxNkJ1gHuPaF408dM+khk7RTG6aGWYYiJB9aubbR1rG5cHYVNbKk0tYGPcDvjK6FaaiKeCNgAc7CzaouMgrPbp5NwNu9R+KeAKO+NnqK+AymOgqXMZnHygjJYfeF0Cw0IEbXuAA7sK2qKdpY5ukYc0t9hGD9q2xaOTkO1R4TtdO180cb2bE75W3oqCjaxpjpoQCQM6Uvi3g6s4dvNTSzRO6pry6GXGz2Z2KbtzQxgAznO+66XkaRx4MaUto3dohhp4mNjjY0Y7GhaKBwaBgLLWycGJoHYr+lnBaFy5JM9KGOJZh4LSmXgZyEhjwTsUpztlySk2dEIIZcwOdnKcDdI2KaLt8ZTrTkLK9msoqh0DAG2V03obqHS2aupD/EVIdjua9v3hc0YCRvjK1fRxxHbOHKm5Pu7pWUssLXao26sOae0d2CuvjS6yPM50bxM6Fxs0fgneA7Ia+kdGf6WG/tWWt3D9qr+i9lmu9M2qbZRPTNc44ewxkhuD2bEKfxBxVYOIOF3vstyhqYnVVPHKAcFrTK3OQVAulyZT8UXbhuMtEl4rKaqiAPzHbTn3Rf1l6balo+Zl+xloehmyRSQTvr64tMbTLESPSxk4Pdur23WyktV8uFLQ07IIRS0+lrfAOW2q5WFzjkDJzzWRqZgeKa4ZBxSQ8j4uTjijEhY0izotjjn5oT72gjdRKOVuo78hhSOsbnmtjQAb4LU8BSNhFxmefNYxjneoZKypkal1l1+LOEL9IxwEs0UcEW/znEj7MqckusWxHm74QVydU26SXJc+urtTWj527nY+xZ9lKLZY6a2BwM0emSo8HuGcezktlxrYX1V04brJ2/uCCKorXg/O0uDGD2kFc9t9bJcpbnWuO0lQ3SPDcBebw7cf+9k9rdGo4uIcXHc4ghHqywLCy0zmzTTyEAFuwWy4urXwTuh8m62MwQEkHG/VhY+qEssReynkYw7ecV6K0aERswfJiQkudGApTnPeyKHm1259SiU1OHSjrCWHYZxyVhN1DhIY3Fro2aWjv8AFaAtD9Eamnhdoa7qyfnDmo8sjnddJI97JIyHRFvYRvlWEVZrpImzantbjTvsolQxksTpezJyEqBbM7drlcLtSRT10r5CCdJd2qrEeFZSNItUQ+aHu+1Qu1UkWMvaBnCbwn39qbVCY2RsgwAO328U4RkJt2xTQiTTUbhOxzZGFhIOQd1sYuD6i6tdUQVcLBEMkFwBI5rI0x1OGHDKt6dk+JHCV+zOQcR4KJejRnKyN8s75Awc8JETpqd7XtyHDuVkGFpIc0j1hKDG8yEWBGrK+eqiYJi52gYBPcoGTk7FXjaXrYHyBuWt5qHLCwbgKrTROyt5PWl4JdrnrYj2wAj1h4VI6NuxwrngvzbpUDvpnH3EFKS0NHpvpItTm2VsmjYRgk+wLzdemaXyt8SvZXSXQMl4LMjW4/czHZ/ogrx5xAwCecduorCGpGkloxbhirx4pTNQjJHNu49YKOTataMdqdeAA7A5ldLMy14gZHU1z6qEeZM1r/aQM/Wq0t0gjCn2kmppJKd3px+c3xCYq2BpyO5Q3TH9ETTg7pcYw4HxTbnDkEpmcZCoQ7VDEhKh1AyAQrKqETomPafO0+cPFV02NKm3Y/oZA23RgIc9lKmo3wem4bjOyrwXpFIQAyUZ5ok1sTJdPSiZx3xpblHBJ1lYXnZRmTSMyA4gFGzOHOBxgJUM0VkmpRWy0lXkQVcfVlw+a4HLSqepBgnez6Ly0e9RtbiAQd+YKOZ0j4w9+Tnt70UAckmpBpGdkyOfan2t+TDiCM8iUdQFGU9gSHuL25JSO3vRO1kYA2TSAIHY43UmOMR290rucr9LR4Dn9qZgic4gE6Rnc9yfrZY3vbHBnqYxhmeZ8SkNIRHu7OO1e4Pg3PEnQhw6QfRilZ7pXLw9Gva/wXpA/oStLc7xzVDf/EP3qWU/DrQOWN9SCTH+9tPgjJGFmyBLyoE4zIW/SaW+8YU5+wCiY+XZ4uCQHgXipmjiKuZjGJXD6yqoq+49idDxjdY3c21Lx/WKol0rwSPUAtttGAIWDCUKCjz+9MAUIzOz6RShKT3rJsdEw2+iO2hp9qDbXRH+KHvUTrCDsliYhJCZKNqo/oY9qIWijzkA+9MioOEHVTWbve1vrdhO7Af+K6PP72D7UfxXRDfq/rUby6HP8Ii/TCT5dET/AAiL9MKUBK+K6Q8m/wBZAWmmPYR/SUYVsX4xF+mEfl0Y5VMX6YVWIkm00+O3H5ylUjRRSMdGctB3CrDXx/jEf6YRCuizvPFj88feuXl4FnxuLN+PleLImbKKRrJ9Q9F+6QMwVT8eseIVPR3KndA1pqIsg7eeFK+MqfU0OnhJ5Z6wfevg88JYpuLR9VimpxUkS6/S6fzQNMjcgdxUWky17mnsQdVUzsEVEORy+UCbE8Rl+TljcTz0uBK5pX6bxZmem+0C7dH1Y9rNUtCRUs23wNnfUVwHh/8Ah0AH8m8ew4XqyoijqqeWkmAMVRG6J4Pc4YXmC3UMtDxHWW5zCZqMyx8u5wC+q/A57i4M8b8ni12PQVwqQeF7W3TuTF/ZKqqGuiipI2vB163DSOwFys6puOGrQ8jk5g/qFZrq59etoPVmTn7d17k0eIjQyWymuNbJJO0HqwGsyUxUcO285Gho/pIVkojrMNdlukcim3zuIWuNWiZEf4ggyRhpA5eel/ENMWYMETj3l6W17iMpJe7PNXpEjLuHIC04a0YHY9VlfX/goZjbpdNfPCY2uByY2nmfWrC6XJlvonzyHLsYY3vK5vcKx9VVPnmdl7jkrj5GdLSO/icZzdsKSVzpHyPc58jzqc5xySSjM4jjyD53cmY/lXZZ2J58Od+feuHu2et8aSoRFVPMmDnPJWUVUyJmHnfsUaKKGOMuGJJHcgOxGad5I1BPsQ8dljBd4YyOtjeYzzwrCmqYmETQP1ROG2eY8FnpKZ2k4zgI6SV0Mb487OHJS5JmmJOLNBNcXPIw7t70G1ZIyXc+SoYp3F+RnZSoXlxCwy5D1sWPRNq3M6su2LioGWlxyQ3Pf2JdQ/UcZ5KHO7AOSuf06HHVArKd8dQ2JxBOM5BVzQQujpPPwc7qtslO6rrWuOSGjG60dxYIKY7dmywyzp0EU6MRfIOomLsjzt/UtR0UGKTjsRTMjfCY3FweMgbc1neID1sbdxknCuejmjqajioQUrHSTGF+A0Z7F28ZnHy1+rPQJ4S4RvFoqq/hyyNmuNPE5z3uly4kAnzWHnnC8tcY/G3Ft+pKCsr5J54mlohYfMpGk7t/OXUbvfrhw02ZsM74J2MIyDjwVHwDQARTVr2B9RO8ySSHm4k5XsuajA+dhhlOdtltwhbqTha2toqCMRuI+UdnLnntyVraGsbKxodk58eSon00r3l5BwO1SaeTqcBcUslnq4oJRov54tcWkdqwvFdFURSGWIO232C2FPXBwAKOsME8eHAH2JWmX4zntm4h8jl6qry38o9i3FuvNLVRjq5mO9RWa4h4ZbWMc+Ful3eAsK+G5cP1IJfJpBxnOxUtUVafp2105IyFDkqNbyzSsnw/xMypgaySQB/Lda63VMBiJIaSe1Sb446M/fo2ta6RrNJ8FjpL4+GoLOtzpO4B3C6TeX0ppZBgA47V5n40lfBxPWmnnIGvBAK3w4+8jPk5fgh2Ov01+Mgy2U57sqQbmSfTcT61wuhvdwp3AtmcQO9WzeLq0Nxk5xzXQ+Izkx/l4I64++Mhacvx45WD6QeJBWxCmjcHEHclY6vvldWHEkrg3uCg9brOXEuPiqxcSSdmfJ/LLJBxj9jg3KVskNIS16i8Pn36GEZRBGUgAhsiCNAARI0EAEEaCCAAkuGyUicgGNZOUeUMb5SXcwmJB4yU2/ZL1FJLS7KXo0bno1ux6qSikd6J8z1LdyHMeWjdcSs1a633GOfJDQfO9S7fwfRVd9DHUrHGJw3djZeZyIU7Pa4WXtGiBTUc1fXNip43Oe49gXV+EOHJaWCIzgl4G6sOG7BTWamDmws64jz5HDdW5uUMDQxgy7vXLR2tkuSsjoIQNu5U914m0Rua0hQ7vWiQlxdhZWpbLW1B6sksG2UWzPqWb6yK/wAE1JX08c8B7HN5HwPYsTxLwcaKY1NtBkpwMujO7m+rvWtt0LqJ5BO7lIkqXPqXgDzRtlNtiqvDmVBKyMlm4OVe0lQ3AGfYtDcbPbLkSaqENdg4lZ5rgfZzWOrqOvtkxZLG98QPmSgZyPFRJ2awmX0dQ3bCeEwcsf8AG0zcFsbjg77IfGtfICY4i0eIWEo2bRypGuLxqO4T8L9+YVPY5zWUpZUOENQDtkcwlztuVI8v6k1EQHNh3HsXM8kYy6sFyoXTL1nPJOyXLD11M9rmZ1NO2eYWfpbyx+zjpd2g5BCvKGrBLXDDh3d66ImedKUXRibiZ2HyG2ZjqC7DdPMuzsNue+F1e0UlPeeLKG7SzPE9PY8SjtEjpS1wz2YLSneC7Daae/zV8dG11S6ASxOd5wb5xyRntTvC8bqXpTu9tkZ5j7c6qh7nNdIHEew59678MZVbPkZY3jmyxoeHWVsb5DWVOWOxu87pyK1Moqt+lzy97AHknOcHZXfD5gHW0jKmGSpjOZo2vBczO4yEzcQRXE/k4PvXfGqG3ZX0wdGTv2qU1x71GbkNOfpFPMKtCHNRWX40q5aientFMC6Qua447Xu81g+vK02WtBe84a0Zd6hushw9OZr5X8Qz+cyghfWAHkXejE33ke5ed+RyNY+q+xMy/wAIy6w22imt9E9um20MVuY5p5yfO+sn3LjHB7dFsqGE5GpivOmmqqDTW9k0jn+V1EsshPznNwPtcVT8LsfFS1UUjXMeHMyHDBCvgL9bGqPWnRV0S8EcZ9H9Hd77b5ZqycljpGzluAzYYA7k9VfBz4BFTJCKu8QRDdp63ICq+hvpd4I4Zt1DwZxNNJQVTWiaKpeCYnCXcZPYcr0HT1NirKaOeCuo5oZGhzXNmaQ4Hkea7Wtlo4nT/Bu6OoIC6eoudT/pPKMfUElnwcujN7HyRT3Rzsb4qckfUu5x09sacxyQ790gKMUFAXF7C1rnc3NdjKTZWjgNH8HThB8pMst18nbkNzK3YI6/4OnCEoDbf5e4cnfujdd9ktcLxgTyD1FEbVG1gDJXNI5FTtgj599LnRrJwpw++4U0rX0sNT1UjCcPY4uIHrXI3he4fhkcG8UXPg6ldw1ahXwCXNxbCzMmkEFrwO3fmvMXRRwrwbxBJeoOM7zX2eopywUgjiJ79WoY7+xWpAznB5pK6Nx9wbwZYaIS2biqou8pcB1Qp9BA7ySufysYHnq2PDfyuapMGhlNu33KlRsi0nrHPB7MBRHZ1AAHGd0yQ6KV8dfGWjVhwOO/fkuj07oJmkT280sr+WoDzlzujYPjWPBwA7I27lvXXSnqaIteermbgjbbPgih2ZnjF7qS6RiJoa10IyMc91Do5DPSl72gedjZSON5456umkjdqzEQduWCoduOKEj8sooZZ0NUIKGppQ3V1wGk/RKhuppcZA1FHEcuU5riPHCkTM+9wMugnDs49SveFGdTdqiNxyRSyZPuWfe4OrXOA5v/AGrQ2MgcTzg/OpJD/VTb1QJbPeXGsEUnR+1j2nJoI3Bw5egF4g4kjDa2cA589y9ycbVDG9GcTm43t8RH6DV4i4l0mun79RXNjf7ms1UTA1GRWNOfnJ5xa/VjvTdXtWbjtTjIwGyFp3XYzElWxkrZBLHsBsVMq6Yu2BG4yq+grpKN/oB2RjBV5NVMma7YDzAGjuUNDKN1ulx5rgSlMo5mNwQM+tWbpGhrXA7lwBCOeRpmdjkTskMpn00wOBvlRp43sGXggE4V3M4NaD4qJcSDbmAjzutyPcmhMitp2OAJRyRPeADISB3pyL0AlKpCRDdTvBJyMJBid2BT0WB3KUwK10UmOScia5sTsg7qdgY5JPsCYEJgeBjBUipf1kTW52a1rQMJ/A54Tbg0b6UIZDDSBlGHuLQDnbkpJx3JuQdowmhDbSc5wlOe4BLYMDcJY5ckwIxeSjanzgDl9SbfIDybhIaYWQBzXsv4JkrZOhimYHgvZX1LSM7jcHkvGIaCeS9CfB4lI4Ckax7g5lfJuDgjZpUsbdnq6I5hb6keFzrh/iquo2sjqnOqqflhx89o8D+wroFDVQVlIypppBJG8ZBH2HxWbELk2CiP/fWfnBSpCCokh+UZ60kJnh3pXj6npEvUfdVSf2isoTutx04x9X0n3sYwTVP+1YddF6Ej0v5O/O7T7ktsDwOSxDrndic+XTnHii+Mrv2V0/vWIzd+TuPYj8mdsAufyXK9HlcKgDwdhSYb/fYqcsbWHbfUWglCYmX9+rX0r/JqfaUDz3Y9Hw9azE0zXSnrpwXnnqdusxcLzdnRz1D6yQuw558e1ekq2+t4E6QOjnozoLHZ6mzXWhpDeHVNG2SarlqHujLy48sOGrt542GEDOMCEkZA+pMl0LX6DIzVnGM7q245sdntF641tUHFstDcbbe20VptXkxeJ4ZHt36zs0B+N/o7812iW8Utq6frT0Kw8PWWXhOS3tp6qOSkBmllNO+Tres5580Dv3JznCAo4K9rWt1OLWjvPJG2IuGQAR3gLfdAlw4cpeleLge48JU95uDr3W07LtWzaxBBCJNDWREaS/MZy7bmuW8U3Kuj4tv0cc7mxsutW1rQBhoE7wB4DCAZaujDBl4ACAjBbkAEKT0X18tPUXriu5P62isFvdK1kjQWyVEnmRNIPPfJWV4fr7her5b7Qy4yCavqmQl4aPNL3ec7HhuUWBooXtDtGpuR2Ka4tLASBha/pMtV7js1zsfCUXDotdtiZLU00Mgkuj2t84yvPMZOfN5kevCxvAN54SfBYK6suMl6e0PkuVtZDodER6AJds4HYnvx3HC8n8hxFk/ZHo8TO4rqxynnhfgNewnuGEt0scZGXtaTy3wtzU3eXiDo24kvHEFsttNTRStZZJIKZscgk1eg0jdwHIn87u2uLPw7WWnhazxWNvDjb1dqfr557s4GV5c3IihYRtgHc9/YV5f8O3Sejt/kV9GOsN+kikZT1chkgJwHuO7Pb3LnnSo6q4X6Rqu70HUtNbTMewPYHNcTs/b2fWtNLTVFHUTUVXE6Kpp3mKVjubXDmqnpjtzrjwfZ7uHAS0rzTvJ7WnOPrCjhP4c6+rNM3/JjdmPq+kviyohELqyBjAchrIQMKAeMOIZxpdcXgE8mgBUL6d4I1SNA7cbpUEbesHyx9y+vcE0fP3s7F0aeW19kdV1EkkznykBzjnOFrxSyAeg73Kh6Npo5eEaVtO4x9UXRux9IHc+1aVhmxg1MufBKOtEMZbTSaT5jvcm52tgjfLN5jGDLiewKxhMw/j5Ssj0kV7ooobcJ3F841yD8kclOSXWNl4Yd5pGSv92dcqp8g82IHDG+CpMuc8hSZmDOGo44cHON14eR9pXZ9NhxqEUg4fMGG+1SckRuOdyEmOIgZITkUL5JAOxZORpKND1vg81hwrBsQB3SfNhaOQwkvqCXYHIhQ5N6M6HKotERxzwqeFjnTFxGQrN2S05TMMJbrJ5YKIugG4wNBwBunacfJZTVOMtDVOEXyIACxySPZxJJIiPOM9qhVDtb8BT6iItiJTNJT6nBxaCojPRpIu+Fo2wxF7whxLWtLQxu2QiicWRBg2CpLvOJJnc8N2XO/wB52D0iDK8S1TGu3a3crW9FfET+EuIXXyCKOWZrHNDXjIIIWPibsXY3KurHQx1Vorq0VIa+AEiINzqA8V6vHi7PK5mSo0TOk3iR3F16EsVJFSvleDK2IbELU8IxMipGNcAMgBYbhOl8rb5W9uXPO2ewLb0xfDAzSCAF2zbo4cEV4arQ0s09mFArqTALozul26tEsekndTQ3Lc9ixqzsSoz0NSWOLJNiFY0zw8gg/WoN/p9OXtGDjsVZbroaeYQzEAZ71PgaN1TxtczJHYqLibh+GugeNI3HcptHcWFgDXAjHenZa/IxhV2Yqt0cV4ittdZJXuY1zmN3BCj2DpDZA4Q1RfHjY55Lr1wpYK9jhNG1wIwQQua8XdHFNUh0tCND85wrxqLey5qcVcRjibpDofInNppOue4Y8wrklXUSVdTLUykl8ji4nPen7xaay11T4aqFzQ12MntUYAHAC9HDCK2jxebyMk/1kJaMI8JYjRvZhq7DyhvCcYCm280+3ZUkA4BnAS0kHZKbuqAUiKNySpYBjkjRBGhDQEEEEABBDBQIwix0BEeSNEeSBCSE2dk6kPTTJEYSmYGxRIHmEFWWfC1pbd79T0j/AN6Lsv8AUvV/CFNb7dbIrfAySKJrQDoG7vavKvC1f8W3eGpPLkV3ywcQMlpGTdbkYC8/lSaZ7n4qMZJ2by8yQRR4pw9o/KfklZiuvEUAJkla31lQrhc6mrZ8iDp55yq232x9dWtNQCW57V59nozSLKKsqLrM1lK1zozzcO1aajtraaAB+zsbo6NlJboAyFoBA7FW3m9c2QnU/wAFaOV3Ym7zRQys0nJ7QitrXTwzPIwHOyFUsa+RwlqcklWUTnwQg6i0BTIdWNuqGhxYUbZMtLXbtPYVW1M5dU9Y0YB5+JTglc7zs4woslqh82uhkeXvhAJ7W7IMtVK150E6T2EBNxVbsE4zhOeVEjPJKwVsDrVAJMsG/eAhUxS0xL43F7RsQOzxTkNaWkE74TNZUGR7JGvwWk+og9i5uRjjkWzDNjuIzW0lDcYg2doa/HmyxnDgqR7bhaKlkUsvXRH0ZQPSHj3FWVU57R5RE3ZvpMHZ6koTtnpyx2HZ33C4cWaWKfWRxYuZ1fRm74Eq56m2R1NNpkmpJC1zfpsIyR7lYXe62ug6QuE6t72gXKmqqMS55Z0OaD7chY7o8uT7ZXyx4xE97AfDxVx0gUNuuVVZ54YtE8dTM4vaPQPUucHY/OaF9FjmpRTRz8hJsjcY8G3+s6Ta248M1jaExxQunnMhA63G7cDnsAcKJxncOkqxtbcaiotlXDA0de2CHII5Zd/w5LGQdI/GEsVRU092jhMshnMegEFx7879mFoeFOlqku1W218TQw0tTKwxtnaPkZDyw4fNytIvZwqX0avg/iqj4jsj6mNogqoCBUQHmwntHe09iuIKouAI5LkPE1HVdH/EUd/trDJZqz5Gdmdo8nkfDtBXTrVJrp4ng5DmhwPgRkLojKxpj3E1W6KyyNa4iSc9U0jx5/Us8JBR8GVjg7BrqhjMZ36uPJ/tJ/iypdJWwUzD+9szj8p3JV/Fji2CjtcXnHDYgB2uJH7SV4fPyuWZpeIiTtmA6aLZ1E3Rp1ke9bHUVDge3VMCPqAWfvTer4guobjzmwv9pH/Bdb+E5a20/HXRlQDOikt0wI/Mxn61yS9PzxHcttxFAPqXdii4ZIQ/0aJ0VPSVj4+pSe220/2FUEdzuUDQIa+qjYB5rWzOAH1q/wCks5vdGRyNth/aswDkYXo3TOhK0WEfFV8jacXa4cuyof8AelR8ZcStf8lfrm3HdUv+9UQlMU5OAQOwrU8L8M37id0TLFZauuL3BuqOI6B4l3LAWmiPGKZ0g8axAGPia7Nx2iqd96m0vSz0iwD5LjK7gjlmcu+1a7/AlfKSEzcQXvhuyxD0+vrmucB6mrD8R2WyWmqdT0fE1suRacF0IcB7yp0wsuI+nXpUhj0DjGuPi/Sf2LE1PEN1qrnVXKeskfVVchkmk5FzjzKi3CLDiWhrm4zkbqEDvjsVdQu/SdUXKqlB6yVzvWob53l3PKS/0U2eaaQmxx1Q8N7Eyag7nmlxjU7BGykMo4pAc5HqTdICEJXsqGytOHYyphr64gFrX47wNlBqRhxA7NloWziCnpGaQWyQA+3KQmynuRlcY+tJzjKdt5/c2Dv5yF8LTPHg825PvRUpEdE52d8oqx2SYyesAU5jssz4KupXdYC7tATMtY9r2ta7ABOVKRRDeSKgkc9S0NmIPEu/zqSX+wVnnu1Slw7SrnhqV0/ETHYAzDI3/wAMqmgPafFl41dHNACdnW+H/dheT+JXB1wlc3tcV2riK7SScE2tgfzoYcjP5AXCr9I4yvlzuCsIRqVlOWqMlcQRcDnvSPOMmAd0VfI51bqPel4AkDgVuZhTSZxnYhWsb9ULHd7QqeQ5eSp1HLrj0HbSEwH35O6jVL3tmBDjyTsUzHsy46cFOU8EdVI4F7AQNslIdkKOV7zgk7cslCqlcYwzPI5UqeiMI1tI5dirnZOpxKBWxDZZBycUpk7hzKaSosdY3VyzuhiHxUY5pYnwN03UMa2Z22wOwSZgAwYCWmUO+UszuMJXWs+kFBKJpKdCLAPaRs5B7hhQg7CIknmSigskvIxzCDiMDdMN3bhPMALMIBIUCNPNGCCEzggndFqwgBcrsnTn1rrPwYOii1dLXE13tN1u1dbo6GibUsfSMY5ziZNODqB29S489x3XWPg6cf2Pgan46+Oqiqgku/Dc9DQugjc4moOdIy30efpchjmpY0bHpf6JuhngFl2tM/SJxIzielpjLTUFRajpneRlgDxGGlrjtqDsDftGFE+Dm7PBlewkZbcDt3ZY1N13Szwt0jdDNRw70ptqPwuslMTYL3TwF8lQ7G0UpHeQA4nYjztnDdn4NkoPDd3iLhqFYx2M77x/8FIHXoP3paPgi6OpLkKN7vkKk6d/mv7D7eXuWZp3tczSHAkcxlPMeYpGSNOCxwcD4g5UsR1x+VFqexSdWpod3gH3qNUqQPHPwhmBnSpdhjGqTV7wCudkBdP+E3H1fSnWPxjWxjve0Ll5XQvAPTg6OQc5ucw9gR/4NmHndqj2YTh45p8/vjfejHHFP9MLIEmJb0bwcnXOpf7QED0ZUjtjcqkZ/KCN3HFOR6aT+HcIPpD3oTSCmYa7dH0cE1RRPrajbLdyOWNj7iuuuruAL/xPwZx3xHernb71w1RwwVFsionStrJISTG5rxsBqJPuBxjKwt94kpLi0SB7WTtGA7sI7is5NfpY3HMRd4t3+xFoC84jstm4lqOJuLq653Cj4jrLoKugoWQ6oXMLgfOfjYtAHaPR5HO3TnXro9rOlC3dLlZdLrDfKShEcljbROIkqBE6MOEvo6dLiO7kcjkuIfhJJn95kHb6JSXcSyj+Kk/RKLQza9GUNvsXS7bONbxPJCwVtTVVRY1zw10rJeTRkkan4WbvPCNruV8utw62dzKqvqKhnnluWvlc4bdmxCrTxLLj96k/QKL8JJjyik/RKLQUbB/Dtnt/Rvb+H6R8Ukl0rHXC4BsmotazzYmO7j24UKzWOkst3obtRUsXXUVQydoAxnSdxnxGR7VnBxJM3JEL9+3QUo8T1BGOqk/RKLQUdYhk4NtfEV+4utVXXVFxu9NJE23OpCwRPkxqLpORGQD78ZXPOGujjg21VtjqnXi5s1tcLuxsB8xo9FjCNzq5ZGcc9lTv4kqMjEco/olF+EtTz6uX9EpPq/Rq14dM4/qOF75II4eLKilpKGnMdvtUdmkbHHhv0idyTtqI2H1qgu3Ct6k4XvF/uddbrlYImRy08dK6UVIYQWlrh6OSN/b3ZXNaW8urKtkcsUmp2wOk81ooLdXS4DKSYnxYR9q+f5k3gyNpaPW48PlhQ9fbj8c8R3K7iF0QrKh0rIzza3YAHHbgBX9ysdPW8Hm11zTo0tfJjmCDqOPrTdhsXUStqKwtMg3ZGNwD3nvK0rWsczQdw7YjwXhy5PbImj044esGmZuDoK4dmhZMySqe17Q5p2IIIyE/F0F2WPcMkP5wCyUfGNdwxdazh2sqJHCklPk7nOPnRndoVkzpDnLdpHj2lfc8fKp40z5jLj6zZvrP0eUlqo20tNHpjBz2c1ZN4NbsWjH9Jq5e7pBmx++O9qT+H0ru0+1bWjFpnVG8IFu5JAG5Opuy858YVjLjxJXVjHZiEro4fBjdh9mVr7xxzVSWqpjheQ98ZYD69j9S5xCct0EclwczJ+tI9L8biuXZgjGTqKeY1z3gN9qUyPOzVZUFMGRlzhuV405UtHvpDbY2iM53wE9SMAbnG5TkkQOwCcADQBhZRk/sWQp7rM4ShncUUDnvkGAUK5uqsOeRKmU8LYx61qtoxHgDjGAiq3CCkc441P2CeiGyhXLMtRHC30W7lS2XjVsRQb81YsORsNkzTQNA2UkYaDnAwubIz1oPRDrHEMx9SOiBDcu2Tco66YFu4CkEFrT3LO1RqFW1IjiOOZ2VG5wlkJdnSPrUmum1kgdnJIhpJDEHSebHnOStcEDLLJJDXVSSjDNLS4HBPILPW7iqS3wXCAPLm1TNDQOTcZWz+TDQAANveFkr9wzFUTSVFCQxx36vG2fBezx0k9nhcxuS0XvRrf4JYm0cjw2YHZvaQuqRRNNG12F5ttkdTar9A+Zr43MdnPevQlmucVVRRedzaFrmVEcJtupCtZgkJaSFd2erM5bGPOJ2xlVlXAJIzpVfSVVRQzEsODyyVyyZ6Mom84msVELSS64NFS5uRG0guz3bclhL5b5DZzQ07WRudgyTY1PcR4nl7FOhrXucXukL3HtKlwuExwQCnF72ZdWciqOJbnw9X6KsvdTg4yVq7HxdBdGAwysJxy1bq0444Vp7vQvaIgHlu2B2rhFxpLrwvczhrmBrtsciuiONSRzZMrxys9F0NUJcAuwraKnjePTC4nwpx5FIxkNYdEg7T2rpFsvsE8QMcoO3eoeJxO/Dmjl8GOPuH7fWW+WR8UbpC3BONwvPVXAIK2aEbaHlq71xpfqektUkk0zW6m4A7SVwaonNTVyznm95K7OHbbs838xGMYpoQMA+KIkEbpZAxlNFenR8+wsepKAyUQ3Kca0c0AKa3ZLwAAiHJBJsAycosII2pAGgggmMCCCCADBQKJBFDsCI8kaPsQIQkuBSjzROQhDaJLIS6Kkqq6rjpKKnkqKiQ6WMYMklEpIENB4aMuOAO1dR6JeAuI79Uw3Osrqm3WlmHtD3EGbwDT2LR9HfRbbLUYrnxVPFPVAamUg85rD495XTKi4M0tihAbG0YaANgFw58sfD1OJxZ/5eCJrZQUkQp6ZuoNGNR5lNxwRU8erYFGyobjLj71TXi8xtJiiGt+OTV5zZ6qTHLpXB2Yojue5NWyiBb1socSeWULNbp5yKioGkHcDuU+5VEFDHu7cDtVJiZW3mZsMsbSQAOxNuuEcrQxpHLfdZu7TyXGcv1loB7Co0TJoTnrCQlIdGjlO+QiM23JUhr5Az0inW1WtvnFRREi1ZUhhwRsVIYQ5uocln31J1+kd+SmR1Tg1gHnA8/BTYqLOWQM593YmHudgEdqiNnLvNccnJTnWADchS6ZVaEU9S+GqkikdqDjlue7uUgxgHVHgAqtq3hxJ5Obu0qVTTCWIOBy7tC8vmYX/kfPc/juE+6LzhtrJri2AvLJJHMDfEgrqTrC7rmzdYDo5AhcepydTJGEtkZu0g4wRyK6vw/wAYUFZbo3VjJWVbW6Zmt5Ej5w8Cuv8AE8uL/SRzxl3VMzvE/RXZr250rWGiqCf32n83PrHJY259CdphJ668XB406tmtHauzR8RWgEZbUHPcAuF9Kl54vtfEM1/obtLJaJ5CIgN2QNBx1bx2d695qPofEjXizxQcNN4eq62ouFPLE6IOqcFwBGBv24WhtFE2lt9NA54PVxMjJ/NaBn6ly63cci+w2wsa2Kr6x0dQxo2BA9IeBXQJK+RlmqZnHBbCQPWRhUmopsyeiqpH+X8QGZ2CwyukP5reX7FP4XoxeulC2UjvPZHOJXjwZ5x+sBVfDmmGKomPzY9I+0rU/B9h8r45ude4Bwp6PSHdznOA+wL5eMnlzqP9siLtkT4UsBfxtw1VnBMNuqtHgXSALz5cZ2y8TXnG+jqW+4Bd9+ERcY6/jmnoY3ahQUzYXEfSc7UR9i840UvlN6vsu3nzuxvtgPwPsXvYZ9+T/wBItbkK6ST/AI0oMdtui+0rLDmtX0jgurra4cvi9nt84rJnku9vZ2RWiNVM31AZWxoelrpBpeEoeEqC/eQ2uGIwiOnhaxxYewuG59ayjhkYUNrcVbG55lXEiSotnQPn0yVFTLUOc3frHlx+tR2U8WstIwFMngkpng51NxsVFlcPSwqpWQM1TA04jeQSOWVF9EgFSagEPaSN9ITDuaoQl42TZG6eSHAJWOgR+mrKFuR7FWR/vgVrB6I9STHRSVm0zge9XNW0+R0cg7IwPYqisaTUO9auhI11lgO2WEN+tJ+CoqrkdUgydwNkIw11v83V1gk9mnCTcN3hwT1qkpRI1lbr6knfRzV3oQzSTuhedXI7JmXeRxHInKtr5FQxTxtouscwsydRB3VU5uCUrKoQOat+ETjiOmA7Q8f1Sqh3pBW/CAJ4kpMdpcP6pQwO019WZOE7YCdxRxgj+iuVXwu65+HHBK3M85PDVHg7iBo9wXP7s8mZwyoj6Nmcq/4Rkd6DziZwHLKFWMTj1oPbmU7qyQO5pxhIbkJOnvTsTA/ABBTAb0vcNs4RtD25wSpbwxrAA0Z7VHdzSGgw+XGC84TLgckd6eaBhNnfKBEc7FBvpD1oO5lBNC+yXVfvztueCm5RloTjyXYPgku9EBTRRGcMIgnJGlEGHCdiEoIy0jmiTEG0gc04122yaS2ZAQNMWQeeUgpRdnbCSUMBp43I8UQ22S5B2prtUAOBeqfgqXjhHi3gGTo7usFDY77RTl9suzA1jqp0hLgyXtc7m0A8xgDBG/lYL0v8FvpMudv4ZqOGabhrhWaO2lszKqoonGeQveT57g4aiDyPdjuSYzsfGdhn4d4G4PpLjQ09Ndeuq2Vj4wCZMEkHUPSBGkjPYVm6aJ1RUxQMGXSPDR7Srbi7jC9cXijF3p7fD5FI98fkrHjJcMHOpx7lYcB2l75xdJ24YzIhyPSPIu9nJZydBRtMYGnsAwFGqeWVJKjTnzd0lsR5Q+FTHp6Rte+H08bv6v8AwXI12j4WcWnjSjf9Okj/APqXF10LwZfDiGsHzGIzxJWD+LjVd5M7vRmnONs5XPRomTzxLW/yTEX4R1n8k1V/kzj2IzSu7kUFk08RVg26tituEauvvl5FC0sjAidK4jnhuPvWc8mcexde6LOE7XbbVR8SVNwcyqq6Vwcx+Axocdt+/AUTuKKhCWSSjFWzMcY01VY6anlEwc6Z5bgjOMDKyU/EFxaSQI/aF3fiDhOz8TwQddc39XC5zmmnwQc9/uVSeiXhxwwa6tPtCmE7HkxSxvrNU/8AZxd3Elz7GxD2JB4luo/k8eDV2kdEPCx9KsrT7QlN6IOEu2rrv0ldIg4k7ii6gcov0Uh3Fd3HbF+iu5f4IOEM+dUVx/pBEeh/gs85Lh+sVaFs4Y/iu8/ykf6KQeLbz9KP16V3dvQ7wSR5zrgf+9Sv8DvAwxmKvd65kNIa0cDPFl4LtQlDe4tby8V6G6IuLm8ScOsE7mitp8RztB3Pc72qIeh7gYkAQ1ox/pVccMcBcPcN1xrLVJWMlcwsc0vy1w8QvO/I8VZ8TS9Ozh5/ins04Pnp9hLvN3HaFFYcPwexSI3aHteBnB7e5fEuLxypn0fZSVo498JGgqKK6WriGnaeqlaYJsD5zdxn2LmFRfLqGCSlla+IDljzm+teseJ7DbeILG+33SDr6dxa/AOCCO0FYI9GHB5bIyCgqInuGA8TE4X2n4rOsmGvtHzvPx9Z2jgDuJLwWnzwPHSmxxDesbTkf0V1Ot6P5LBWyT1dlN7tZ3L4X6ZYx+b2q7sHDnRfendTS0jvKAMuhllc149i9RxPO7HPOE6qtrbLPUVcpcX1Gho8GjJ+sq1AAIwFe8Y2m2Wa4tt9ppvJ6eJmos1Zy525Kom968nlS/aj3OEqhZPoIg52ojZWjBkYCh2395z4qdFkHUvJyt3R6sfBBGE1M7G+Ut7sPwe1Ra07bHmritGMmQ9JkqskbZVg05I2wAmIsAbc07G4AlaIyaHi4RRukdyAJVMKwSSl3aSnb/VObTNij+fz9SqaMHWMndNrRvhRooahoYCeeETpXzHSMhqiRBvNzseClse1oB5BcU1s9OAtjWxg4UWpqi7LWcu3CKadz8tb7kiYw0sIdP5z3eiwc/apjicpFSnStjVK2MzumqH6Yo/6xRT1L55HOcdLAfMaOwKC6Z0jtTz6gOQRdYSea9TFi6o8zNn7aRNMxOANk5EfOUKI5cpQOBldC0crdh11LS1MZZURMeOwkbhWnDFTHC9sJmwBsAVSzS4GcqBLM6N2ppOQc5VybkiFJRdnZqOVj2gZCbuNuE7CWbHmue8PcViNzYql+OwFb+13eOeJpa9r2kdhWUonVHK5FNqlpJDHJnHirm0TteB5wyhc2U9QzIxlZ8zVNunyAXM8Elo09N+0iRg2ysxxnwrRXujex8QEmNiE7a74yZuCcEc1Nkr9TdjzWsZuJnLGpaZ504o4UuNnqnaY3OizscbqDbb7creCyOZ425O7F6Oq6GnroSKiNr8rnPGfANLI59RSZY7GwC64SjJUzjlhyYm2mcxuV3rrmW+VzmTTyymIRjZPXO11dtmLZ4zp7HYTIdgZXbhiktHkcmeTI+02LkcBtlNEknZJkOopbAtzmoVE09qeCQ3ZLamgDRlEgihASgdklGOST0NBoIIIGBBBAc0MABBGiSQAQQQCYCXDzkTuxKd6RSSmJCHOGcFdx6HbPTW+2trI42GqlHnSfOA8Fwp/prqfRvxdT0tMylqZGMDdsudgLk5LfXR6X4uEJ5v2O0SMg0A4aXEZJKq6ycQuOMeoFZ66cUxTObTWlhuNW84ZFAc48XHkAr3h+0TwReVXmojkq5BkwsOWR+Ge9eY1Jnv5ZKLpEKoNfUDEZ0MPb2qwsdqgjIklGo955qxka1xJAACra+s8kjdLJhkbRknKUdMzfhb3Gup6KkLg9rQO9c2vV9NbUua1x052WV4749dWVopKKT5FhwSO0qFabh1jmhxwXAOGe0HtVOLb8OWWRJ0bek85uUuYYad1WUdVsAT2KaZNY3KTNISTI8pwdxlNOqA3sS6rkFAqX4AClIJEuCoL3HzhnOceCmR1AGwKow8swQnm1Ba3tyUqM3Ki6iqMvxnb1p503m4yqWCXzS4804KgpOI1InySbeKZgrDTVGrcsd6QCivmyMlS+Gbc++cUW61MZrFRM1rhn5ud/qUSxLIurObkJTi7L2jqG1AbNA4OGM4BU8mUsfLSyOY8DOy6B0vcCWax8J/HvDNsNHJb3g1TGOJbJETguI7wcFczttYyojE0Jw4bPbleDnwT4mXsvD59r45Hd6ew8I3PhQXK2N1F9NraRMSQ7TuCO8FcufSx0V1rrLK1s1FUtEojkGoEO3I38cqy6OLrQUF2MVwZqo6vZxzjqn9jvV3qrvd0oKzimnNFWwTmKN0U2h3oODzgFfS8HlLPA1eRSRz2bhulsXSna4rY97aSuBPUO3Ebh3Lp3EQ8nsD2Z3kexn15/YsfxNBOzj+w17fOijc9jvyT3rScSzdZbYWH+WBHuK6c8qxSMJLRDgd1dgmlBI1PIXQvg6COkoL1cptgWF7ifoxn/wDiua1zzFw+xucBxLitlwzUG19Fd0IcWyT20MBB+dJIF83+Ml25Ll/REEjm/Et1fcb5XXWd2XTPknOeWNyPqAXIOD3F1PWPJy4tDve7K3/Fsvk1nusjT+90z2t9ZGn9q5/wdgQVQH8kPtXtfipd3Of+y4PZb9JNNXxUlou/kc5t7qVtN14b5hlBLi3Pfg5WKdUZ+YfcvYvRZTWS+9DIs14MB6m4iZrZANg6PAIz7lieOejCwh7p6Opo4YwO1wwvWezpTo83umONmHKjkOc/XyK1PFlHbLZO6CnrIqlwznqzkD2rNF7XHIGy0hEmUrJ9LW1YawfvngRlA1UZa4ysAPgFGjnAjAZzB5piXJduUxEiskbI8Obs3SAFG+dzTrWfItOd8bpojBQAEl/NLTbigAM9IFW1KAXAeCqW8wrihx1jR4IGVlS0eUyHuJRxTO09V2FwOFJma0zSN7dRTDoQ12oHGEmA1Vxl5w3AI5JuGJzXME0WQHYIKffDVOAmgGotOduYKXNUyzuM8z2mYnLxjG6EISKNschGskY2HcmXROGdSmvnY/DhjON0xPK0jmgtOiBICH4Vlws4jiO34P8AG4PuKr5fOcCFZcMAfH1vOd/KG/tQK9nRZHj8H6PfnCP2rDXUDygnOVsqlrmWOieB5phAHryVjLqT15CSB7KKu/fgg70x4oVwPWA4Rn0geWwVCDPMpcbtO7Tuja0luU2B5+OzKbEKmMgcNZSGyHOOadrAS/1KOxpDkhjxJCbLinDyTByH4TsQl3NANJ2CDuaODJmAQL7H4nO0aXDGEeMkJbhhE30lDZQUrduSbAwn3lM4KBiXc0khOaTnOEHg6T2JoTGmt35JenAOybaTr2UgnLcYVWIZKIoygAcboGEkGMZyEvBQAKmxCA0hdk+C7RVlbfb5T0sLpXeRxPIG2Brxk59a5AAV3f4Gkgbx3eYsenas+6RqH4M9BcPcItz11ze12N+pYdj6z+wLYsa1jGsY0NaBgADYBNUh9MJ3KxmgCJUao9EqS5Rag+aUiWeavhcx4v1pm+lSge5zlwx/pLv3wuoiZLJLj+Idv6n/APFcAK3j4MkwXqOR2HQFntVjBOJgDHE4t71nOHqSWtqnRtaXNaNTnZwGjvJWvttO0t6qmlhmPYGu+zvWb0WvBmmkgkc5shdHjl5uclOaHOBIaMeKJ1RQ0A0Slz5uZYwZKdguVvqI5Gsc6OQAnQ8YKSYyTQ2ioracSxSQtDiWjVnvx2BalhlZSU1JJL1jaaJsTOwAAdg8TusLYKmehqaarZNKRDKJerLzoOOwt5ELejr6oCpdE4GYdZs3AOd8jwXJyYTqz9V/9BflPweHOouPTL1S7Slpv7r/APG//wBEqxVk1Dc4JoXEZe0Pb2OBOCCvR7ejG8FoIrLfgjI3f/dXmYCaFzZGMdraQW7dqvvw444O3x5cf1z/AL0cRVfY4f8A3J53C5XLxfxpKUkn2a/70r/tbO+jowvHbWW73v8AuRjowuw/zy3+9/3Lz8eN+Oey93P9c/70Bxrx0f8A33dP17/vXZcT81pnoF/RndI43PdW2/DQScF/Z7FXfgbU/jdF+kfuXEDxhxzI0tN5ujgRgjr3/emBfuLj/n9d+m5P9QpnaoOBbq27TVD73RvpHsaGQaTmNw5nPip54Nn/AB2k95XBXX3i7P8AD6/9N33ovjzi4/5/X/pu+9TcR7O9jg6X8fo/eUf4IyAf5RpPrXA/jji0/wCf1/6bvvRG58XO/wA+uH6x33ouIqZ3C58JTwxiaOtpZN8ODScj6lCjsdUNjLDt6/uXH4rpxfHK2VlbcHFhzh0jiD4FdGo7jU1FLFOJ529Y0EgvOWnuXy/5jj44T7pHu/js05R6NmwprNUvpzmWI4GO37k2zhgvjErq6njdkgtIO3qVPbbhO1+h1RMQR2vKg8a09wrbDK6hq6mOphd1jCyQgkdo5rP8ZyccJUkXzcEpR9NbFwxFp/yrTjPMEFUXE/RLw5fWdbLcaejrmbx1dO0tkYe/bmuQdZxU47VdxA5/vrvvTodxWRvWXD9c7719appo+fcWtMseKOCL3FWup625UlXLCwR+UAOHWNHJ2MdypI+Crg448ppfe77k/dX3aKlYaisqxI9p5zOzt7VmRXXJtQR5dV8/5Z33rwuRNfI7R7/FjL41Rrabg65R4HlFNgfnfcrCHhSv0b1FNt4u+5ZeiuFxIANbUn/vXferKKrrmsz5ZU/rXfevPnKF+HelPr6TJuE7hqz5RTf1vuTFRwlXOjBFTTasnO7vuVVUV1dlx8tqv1zvvUF9fX4P7uquf8s771tFxrw55dr9L+HhC5D/ADml/rfciqOFLg1jiKmmG2Pnfcqqmq7gWg+W1X6533qmuN3uJlMQr6rY74md960uP9CjGbfpdjhC6ySanVVLgdnnfcnoeDbi+QfK0WB3avuWcjrrjgfu+q3/ANM771Ppa2vBA8uqv1zvvSbh/R3Y8c/7NE7hGtAwH0YPfl33JuPhG8TyOPlNI2Nnmjd33Kpbcatjg11XVyyOOGsbM7J+tWLbVxTVUb5TU1cTA0uZD1zsu+tLHjjL6Ly5ZYlth1PDNZTtLKaelfJnd7tWPZsqqXhK6yyF8lZSuce0l33LN1dyujXua+uq2OacFpmcMfWowulyz/D6v9c7712wwQW6PKy8qc/s1Q4NuecippPe77ktvBty/GqX3u+5ZdlyuA3Nwq/1zvvSxdLhn+H1f6533rRxSMezNZHwbccj900vvd9yfdwfcQ3+E0vvd9yykNzr+2vq/wBc770J7tXt2bX1X6533p0v6L7yr00NTwfcyP4RSf1vuVfU8HXQj+FUnvd9yoJ7tcv5wq/1zvvUGe7XI7fGNX+ud96uMUzCU2Xc/BV1G/ldJ7C/7lu+DuD71SWqIy1dMZHZdjLth2di5fw++6XC5xtdXVnUMOXnr3YOOzmuh3S61dDZKurNbUtEMDnDErueMDt7yr6x8on5ZQVpmno7XW1O4qqU+ILvuVtT8KVMzC2WWnd+l9y802Xi2+W2frBcauRg+a6Zx/aun8LdIvlfVxyVc7JHbbyn71lkxdfo7MXIc16ba6cBXBjuupamnHeMu+5MU1gu0bw2Wop/bq+5PxXmWoiy2sm/Wn70zUdfUAkVU+e8Su+9Y0v6OpOT+y3orHWk+dUU+PW77lMk4XqZm7y057+f3LD1L7pTZLa6owP9K770iPiWth82StnB8ZTj7VUWjVRk/ssuMujvyq3yan02cflfcuNVPR/c2TPYyqo9IO2S/wDurVcacfSeSOpae5VD5HbeZK7zfrXLpLvdHvLjcq3JOf39/wB69Hi3s8n8njUEmmaMcA3b8bove/7k6zgC7D/O6L3v/urMxXO5n/3lWfr3fenvjS5/zjWfr3/eu2jxjR/gFdfxuj97/wC6jHAV1/G6P3v/ALqzfxpc/wCcaz9e/wC9G66XP+caz9e/70UxWaP8A7r+N0fvf/dQHAd1/G6P3v8A7qzrbnc8b3Gs/Xv+9GLnc/5xrP17/vT2BovwCuv43R+9/wDdQ/AK6/jdH73/AN1Z74zuf841n6933ofGdz/nGs/Xu+9KgNH+Ad1/GqP3v/uofgHdfxuj97/uWc+NLn/ONZ+vd96MXS5fzjWfr3felsZo/wAA7p+NUfvf9yH4B3XP8Lo/e/7lnfjS5fzjWfr3feh8aXP+caz9e770UFmi/AO6/jdH73/3UX4BXX8bo/6/3LPfGlz/AJxrP17vvQ+NLn/ONZ+vd96AND+AV1/G6P8Ar/ch+AV1/G6P+v8Acs98aXP+caz9e770PjS5/wA41n6933oA0B4Duuf4XR+9/wDdRHgK6/jdH73/AN1UBudywf8AGNZ+vd96Qbpc9v8AGNZ+vd96Yi9PAF1Jz5VR+9/91XfCvRLebzXMZ5TStp2HMjgX8vcsJ8Z3LJ/xlW4/17/vXdOiu96bPHE2smyeYMpJJ96wzNRjbOzhQnPJUTb2LgiCw0YpbcynacYc8g6j7cJ53DlcX6jPB73fcoVRejCwudVS7c/lD9655xr0nxW9rqe31ktTVHI82U6W+s5XmufZ6R73xvH/AJM6RdIBbKYyVFbTNcAcNJOT9S45xtTcT8QSPiFfSU9Fq8yMOfkjx2XO7pxNe7jWPqaq51jnuOw692B7MqGLpdCcm41n69/3rqxcf7Z5nI5lfrFmj/AG74/hdFn1v/urolL0Y11V0bUHENFXUprbbK6kr4vOOWE5Y/lnbOOS4yLrc8DNxrf17/vW66LeILuK+a0m41To6+PQ5jpnEOI3HM810SgqPMWSV3ZpaDhm6ebmppPe77ldQcM3LTvU0vvd9yw/EVFxBZqp1R5TXNpHO2PXPwzwO6RSXyv0jNwquX8s771xygmz0cOZtWb6ThW4Pb/CaX3u+5RKng+4u5VNL/W+5ZuO8Vrh/Dqr9c770Ul2r+yuqv1zvvWLijpU2/svXcHXMf5zS+933JQ4PuXbU0vvd9yznxpcO2vqv1zvvRPutfp2r6n9c771NITv+zUDhO4gYFTS/wBb7kcfCN1leGRz0znHkAXfcsqLncCR+76o/wDfO+9KjulzjkbJHcaprgcj5Z33okkiez/s1X4JXLBa6opg4dnnfct30DcGV/4curX1FPikg1tcA46XE4zyWApbu+9wCGqq6mKrZ/GMkOXD1Z3XUOhTh3iWKz1VyZVTS+USlmplSfRby5+9PH1s5suVtNHbK6xV1dRT0VVXUslNURuilaYju0jBXmK6cCXjhm/1Nv8AKqdwgkLWudq89nzTy7l3eK28T9rqv/algOmfhq/m2svwkqAKdvV1RFQSQ3Pmu27ice5HPw48uPaPLyRbKOgsVY4NkZU0+e0Zdt9SbvHAk1TDXVFE6miqqmAseWlwD3D0XcuawdBdblQ1Q11lUW8iDK7f61sLdeJ3NbK2snc09nWnb618tHMuLPtFP/5OZutCeELbc6qAwXaWnfX0bdIf5wLmdpO3NXt0sdZPSMaJqfZ4Pzu71LKcYUVdIwX+0VlU2rgaevibM7E0Z9LbPMc/YhU3GsNno3srJ8OaMnrXb/WvZyfk8eTjOSKczQ3rhqufaIY2z0+dH5X3LU3Wy1cHBgt7ZYMu6hmTncN3PYud1NfWTU1ujFXUee9rT8q76XrWg44udVHFTUzKqYYa6RwEh9QXDwJY4Y8uRLwhSRhOOuE7i/hy4tZU0odMWsGS7tdnu8Fk+FeCbnFHU6qmjIMfZq7/AFIdJ9yuMfD0eK6rb1tWACJnD0Wk9/iq7o5bdrlLM0V9Z1eganGd2Bv617X4fr/H7LSZtio2HFln4ioaS109DXwRRyUhMg1PALg7Y7BY+4cOcTVjNEl0gLe4ySfcrjpDhvNa63y2+a4SU9NSvbI+KR5DfPOM4O3Jcznr7q3lca3n+MP+9etBqRsaQdH96cNqikOfF/8AdRHo9vAIaaqiBPi/+6o9vuF3fSRuFfV4x/LO+9Qrrcruyoica6taD/p3b/WtaF6XbOju7ticfKqPII+n/dSX8AXbtqqPPrf/AHVHguF3LiDWVm4/lnfely111AA8rqz/AN6770APN4Du4bpFXR7eL/7qJ3AV1zjyqj97/wC6qSruV1bUSA19Y0gZx17vvS6GsuUzS43CuOO6d/3p/QFseAbtj+FUfvf/AHUn8Abry8qo/e/+6qu4VtyhbGRca0anYOZ3/ema6vuENVJGy5VpYD5v7ofy96Q0XruAboA3FVRHbPN/91WFFwJdQ9pNVR8u9/8AdWMZc7mT/lGs/Xv+9WVDdLn1rAbhV4x/Lu+9ICyruBLuK17m1lGN+9/91SoeA7rLTtc6qo8nnu/7lk7tc7m2sf8A4xrAM/y7/vU62XO5GhjJuFZnffr3d/rQ7oC5PAl5hk1MrKNp7Dl/3JMvAtznHy89CXfSBeD9iz14ut0YGablWDf+Xd96Ypbtc5G73Gs/Xu+9AjS/4NrmW5p6+if+SS/P2KPJ0e3lhw6pox6y/wDuqp+M7mNxca3P+vf96U683Vw0vuNW71zu+9C0Nl5HwRW+TxQONAHMcS6QF+XDsHJTbTwDcYr7RSCopAxszSN3/cscbncBI1zq+sIDgSPKH7+HNWltu1wlulG+Otq2MNSwhvlDyAM8uaAR06bg25vtNK11TS6WR4xl3PUfBZG6cDXWSpJFVRgf0/7q01dNXDhKhkFdVanRO3EzuyR3iub3S6XJtYW/GNXj/Xu+9SvR2S7hwDdi9pFVRY9b/wC6n4ej6rd1YdV0g8zDsufjP6KylwulzLv8pVn6933p+juFc+aJs13rYmEbv655x7Mq9itM0f8Ag9uZyG11INuWX/3UhvR1d8E+WUWx73/3VUT3a4EAivrD4id33pLLtcSCPjCsH/fu+9KxFxPwFd3Pz5XRe9/91IbwBds/wui97/7qoJbpcg7/ACjWf7Q/70Qulz5/GNb/ALQ/709gaL8Abt+N0Xvf/dSHdHt1c/8AhlF73/3VQfGlz/nKs/Xv+9IfdLoDkXKt/wBof96ANE7o7ug/zyi97/7qEfR7dGP1eWUfvf8A3Vmxdbmedyrf9of96I3a58vjKt/Xv+9KyqNUeArqeVXR+9/91E3gG7Z/hdF73/3Vmqe63Mg/4yrT/wDMP+9LF1uev/KNb+vd96hgaQ8A3X8aove/+6g3gC6/jVF73/3VnZLpcgzIuNb+vf8AehR3a5uYAbjWfr3fekBpR0f3X8aov6/91IqOAbroI8qouXe/+6qU3S5dlyrP17vvUee53Qg/4yrP17/vVJ7Atm8AXYO2q6L3v/uqT+AF2x/C6L3v/urJNulzz/lKt/2h/wB6mC6XPSP8Y1n69/3qmI0P4AXX8aove/8AuofgDdfxqi97/uWe+NLn/ONb+vf96L4zuZP+Ua3/AGh/3pUx0aI8AXX8aove/wDuov8AB/dPxqi97/7qz/xpc+y41v69/wB6HxndP5yrP17vvSCjQjgC6/jVF73/AN1da+CrwtcLV0k1Mk9RSuZLbJY8NLs51NPaFwUXS5/zjWfr3feurfBVudc/pegjmrqp7X0FQ3DpnEZ0g9p8EWB7GprfM1zvPZuPFPGgm+mz61W0k0pJ+Vk5fSKkGWX+Vf8ApFZy9EJORkKNONt1IJUec7JCOB/C3jzaLPLgbdYP6zSvOK9M/Cvi1cJ26Ug+bLIPqBXmY+C3j4MdsbHP4VuQh9MVEZl7zH92Va0jhT2x9QBh0bfNI7+xUXDM1RS1bZKdoeXnQ+N3ovaeYK0t6iibYnzUzS2Mubqa47s8CoH9C+HbZWGMVYDQZqaTWTz1H0Cl1lBNB5E+qDDM+meyYgc3DByruxafi6DnswKNxE7VVU0eDtDK77AiPosn+JRwt+RIHcfsXpSz26L8FrEDE13+Loez8n/ivN0bT5M78w/YvW/D9Oz8FbPrDQGUEOSdgPMCWdUtGXGe9mdNupyd4G+5G22wdkLfcptzvtHC4x0UIqHD552Z7O9Us93uUpOJxEO6NgGP2rk6yZ1tpE74uh/kW+5GLfEOULfcqny65fj0/wCkj8vuQ/z6f9JPrIOyLcUEef3ke5H5DH2QhQKa9XGE+c9kze6Rg+0LQ2i80FY4QzsFNMdhqPmuPgfvR0YuyKzyFn8kh5E3+R+pa/yNvcEDSN+iEdWHZGRFC0/xX1I/IG/yX1LW+SNxyCNtI0b4COrDsjJeQ4/ivqQNM5kezMALXOpm45BING1zSC0brDk8b5oNM2wZvjnZjoHYflX1K9skPYcjBVLcaZ9HWvidkAHbxCk26o0nSTzXx6i8GVxf0fRtrLC0JmoR1rw1nI8gE2KTfGjl4K3o3Blw8/dkvmknv7FZyUbdZ80e5fW8PJ8uM+e5MPjkcz6SLXILLDcGtI6l+l+Pou7feuZ1MfnB+O1ekLxamXKy1dveP3+FzW+DuYPvC88yse0ujeN2kg+sLl52Pq+x6H4/L2j1FUwDWg96sAcxqpEmhwyQrCGdrosDuXlvbPTfhHqgAx2yhsj1NCnVT2uIAHYm42tbGSezO66IeHPLWyz4btclzro6WJpIaC+Qj5rQMrEzM1XKcAbdY7HvXeuF7SOG+jy43ysZ1dVPSulAPNjSMNHrOcrhlJG7XrO5O5K3nDpFNhxZrJkaX0OMh0gbZUqCNxbkNJdnAA5knkE5GwFuo8gt50L8Px3e/T3Srj10tuA0AjZ0x9H3DdZY/wDkl1PSySWGDkyx4N4HfQQNrq+Fr614BAP8WO71rWQW6UvALAc7Fal0TXbkBBkLWnZexi46ij5Tk8uWaTZxrpd4Bp56b41tsYjrBGXSsA2kA7fWuIyxPilMcjC1w7CvWXGoIp84/iXj7F574lpqXVJLUuazST55OMLVwSMseVrTMhkDCAeM80I2OqXvlha4Uw9GRwxr9SiSTBlZHCcHV25U9LN1lLBr8BNSy75VhFSRujDidI7ycKXaLFFda00tI9r5QwvcHShoDR25KTjQfK2ZqR7nJMFFPVSYDDp7TywtgbPQ0sEk0tTSNMZwY3zjWfUO1Nuq7ToMfWvGPo4AVNxS2K5S+iVw1Rw01G2IxOBHI+PenuMsN4OumCf3jtH5QUWmv1JCBHC178bblT6qqF9t0lAyiYI5gGSl83Zn6lKzQv0mWHI/o4xz33So3FpBBIwdl1izdG8V4ZVvt9PSfuTZ7X1jWl5/JyfO9ipLvwqy01LoK60OhkB5PcRsuj+RjrfgLj5k9FZw1xfWUj2xVL3PZtgk8l02zcRQ1kLHMmaQQORzhc5ZaLc9wHkrGZOMmQ4RCKktk5ZGWx4OCWPJB+9cs/ie4s9HBPLF1NHYGyRzs3cHZ8VRcUW6ndb3vJwcbYKi8F19kqJ54au51UjWRGRpgwN+4hyqLrcqG7089L8ZVNNJqIjZoDy4Z7ccinDE3s6nyoKNPRzOtb1VVKzVnDjhReblf3bh6anMkjKuOVjMEHGC4FUzW6XYONl6OLw+f5Em5PYIxpCWEEMrdI57Alekk5SmgpiQYRg4RZCHPkihh6kMokECoUgggpEAIwUSCQxSCLKG6LCwwECEAUAdt1WhhHkmycp0jtykc9kmhMb7VZ2niCutJAp8Fvcez1KuLdympAonjUlTNsOeWGXaPpc3niq83RvVzVTmRfQYcZ9feqJ257kNw7ZDBO6zhgjD6NM3MyZv8mI0pQGEvBRhq1s5KCxnGVYWWtnoLlT1cH75A8PZ6x2KEMbZSm56zLeabVhZ67pqagv9igqPJ2SUtbA2QDGRhw+9c/4m6J5etdUcPODGk5MEh2z4HsWu+DLcnXjo/koJyHS2qpMQ7+reNTfZzC6q2jj+iPcuGcGpG0Z0eSbhw/frRIWV9vmYxpwXhuW59ahSFzTvkesL2P5DDKwNliY9o7HNymJOHLPKCJLbSP1fSiCj47RvHPR49Egd2hAlesh0ccJyyFz7NSO1c/kwq3ifoMsN6pdVkkbaK1o283VE/wACOz1hChSL/kpnmAZ5hPRNLyNiT2ALsdD8HPjuWp6uee1RQ53lExIx4DGV2Xoy6D+G+E3x19efje5t3EkrcRxn8lv7So6N+mjypfZyDoU6H6y81kV74ihnpqKI6oafGl8hxzd3DwXRr5wfe+CKt954MfJPbTl1RQO87R4gdo+sLtJiazzQ3A7k1ow7KieL7Ryzn2dnKrB0rcOTxMiu8E9tm5EkF8efXzHtWxpprFf6GaGnqaWvpp4yyRjHg5a4doUDjPo44f4iD5RF5DWOOevhbjJ8RyK4txJ0f8YcI1fllv6+SFpy2opCdvWByWMsk4LaszbSMjx5wxPw/wAR1lpqASYXZiefnxn0XD2fYs/STzUUuD6JO4K6C6DiXjaognvE7D5Mww+UPZh7hnOD34VlLwVZqalLqzMjgPTc7SF4fJwrJJtHHkSuzM2S4AgDVljuSZ4ghiZAI4WBjAQQB4pdTS2qiqSyjqNs7N1ZUetkL4A0uyBsMrw8kJ4W4rxmDYVub11Ta4+X7pA+vKkcU1hqaqpqM+bq0MH5I2TEP7nfTS/Qk1D2gqPeRppPVgFdK5HXA4L7YIyXHVnluljsMUQINVc5mlwHJrWNyfrVhfhR8OcNRWe3DRUTsLi4DDtA2JPrK2FK2nrLNYKNrAH0YnklcRyMj8/2QuSXa7i98Z3SpY7NLGwww92hpx9u6+o4FzhHFHxLZtj9PQvwd4LbV8HXCjrprhG6pijh1QMDm6Tq557c5Xlbi+2C18WXS1NLiylrZYW6hg4a7bIXpj4OlNTVFYzrL1V26SKjbLGIY9YkxI7OoLhXTPFH/hZ4nkiqXVEZr3ObK5uC7IHML28a6ujZaNF0bWCS7cP0wp2REgPBdJs3Y9p7FR9MNjks9NSTSxsYRKQCzdp2710z4N0V0p+H6erc2Ga13GplpJIw4Pk54HmjfmnPhEdHl0o+Abjdaq5SmmoZ2S08E0DgdJOMZ8MrXtsow9noop7TR1PyYMsLXHbwT77YzO4afUFbdGHC9fxJwXaJ7XE90gicJOscGM81xGzj6kXE1pmtkpimaYp49nt6wOHrGE7Qzmd+tUrOIZJZYyKd7MeOMKBG99G18dPq0k53XTrfbKC6xyfGstXTho8ySGMSH1FYXiG1VVqrXQ1MT2sfl0T3D0252KaaehGbrqiaYAS8gcqNIXOAOCSe1T69oFOdt1HZgsB8EIRFBLcEqfQyapMZ7FFeBlHATHIHBP6GFdt5yplqI8hYO7KhVztb9XgnqV7oqRuG6uZKQhN5GWMPiolBkBydrZxND3EO5FM0cjW5ztlP6Al5OUrQHJpsjS7mE/FgnIKQyNUjq8B3apViEjrlSFu7RMwn3qPdBkNPanbLK6KopiP5ZgPvCH4B2uoptXANumx/FSe35V65DeYtNUSe9d3jpnSdGVqOPm1A90zlxHidnV1xLfRKyjpjaMzcWkPanWYNOzfsRXIg6T2ptwPVRY+itSES6aZo+TIzlWFH1Rm6otA1tI3Hgqu3vZFNrkWgoI2zDrGkZzkeCTRSM5UNIed+Saye9TK+nkY9xLTjJ3UJwcOYKaAea3Lc5SZBjZIDyBhEXZKGSgiE24HKcJycJJQhjlJ6LvWnR6RSIGlrTntS/nKJelCpBliRAdATrvRSGhurdSA8Hg8kTiHMPLkhoafRdjKIxlp55CqIFdyPtUth8wbqMR57h4p+LGkK6sX2K145BF1neEZAzyQwO5RQwCTHYi1+CPAQwO5FAAPBXTfgwSiPpqs4P8ZFOz2mMrmWkLf/AAdJDF02cN7jzp3t38Y3BOhHtykI1esKQVEpjiRowpWVnIGAqPLjBT5OyYl5FSFHGvhSx6+BaZ2D5tS8e9h+5eWgvWXwlI+s6OS76FUPrY5eTGncLeHgPQmyVE8AaIsAl2HHG+FsaiOGqsUtPnTI9uxx2rO0TWtwCBj1K7pyREAMbrLsky6ZR3Wvuj3U3k0tRTyMhEUrWnDSRtkBS7W65RxvmqIqiqe9mkyP5RtUm6VUjZ2BsbMsZjOEx5bVyM0anYIxhWpR9InFtUWLW5gcT9A/YvQ1Zd31dqoaSncWUsdLE3HIyEMG58PBeZamWaGhdHrOXtI37l6FoQRbqUdogZ/ZCnI7McKaHgBlHjwRBAkDcnCzSs3D2RO25JIe0nZwJ9aMvYNi4Z9aqgD3Q9yGcjZEgVmr4SvjxIy3Vj9TTtDI7mD9En7FruzsXJ84IIOCOR7l0bh6uNwtUM7z8oPMk/OH/nKKCyyKIoiiQKwIxzQQSGVHFdJ1tGKpg8+PZ3i1ZaN5acrUXStmqGVtHbpIPLYxpEUxw123aVSx2W7siAko8vIGerOoZ8Cvmfy/G/5FKJ7347P+nVkmCQTU+SdwtFballVStc+RjZG7P1EDdZujt90jcNVFMAdj5qmU0Pk9XirpyI3bZeMYKn8dnljnTDm4lONo0HlNHAQ6Srh2PIOyvNt4kh+O7iyAl0QqpAwnu1FehmPtgLcvpG6Tk5c3kN/2LzXVuqJK+sn6o4lqZHtx2gvJC9b8glLHaOX8bayMjVBxOMbqRGXNjBBUfTM6VpML+fcp0sb2sA6p2e4BePGLo9tsS4kncq84EtrrxxHT0wj6yGFwmnBOMsb2e04VFHS1sxLmU7yAO5dO6MLYLRa3Vj7lb4aurOp0NQzJY0HABPYurj4+0qZw8jIlEndN98dFwi22iIxSVszW4znzG8/2LjcEeAGDddJ48sl54nv7JWPtsVFTRhkbxVNDHHmSATnmqUcJNosuqbxbdQPosk1H6lfNd/qjf8VCMIdpfZmZmaYw0d67L0QVtoouDYYRVwtqZ5XzTNLhnJ2A9wWBksVpfTmabiCFhwcMZE4lVsdHwxZC1zKi41lS9pfoc3Q3Ph4KODjcZWzT8nmjLF0TPRMT45Wgxva4HuKi3K6W22xGavuFNSxjm6WQNXKLC+58YVVPafKqiz0kEBf1lI7EjwDjBK1VB0acKUsrZ6ulmuk7f4yumMv1HZe5Z8r4Z3jnpFobjih4Voau91GlzTJGwtgYT2l5/YuRV9rrqupM/EFQyZ4Jc2mh2iYfH6S9B8XU0VNTQUtHBHTQFjssiYGhch4jjDap+wATfgRezJXDDY9I2AG2OxZyBkEvEVE2qBMXW+cAcasDYZ8StLVQT1Mwgp4pJpXHDWRtLnH2BSqPot4uuNTDUPoPIomPa8vqHhpABznHPsWXbZqV89dZKlxpa+GvpXNz+8M80HuwVruCXcJUlE6tkLKOCPAdV1TdbnO7gBun6iKmdO4Phjka4nct35qHLw3aZ3lxp2bnkNllklejaORItLzfOEaGqEtXDR1hlbqZNCxrtQ8e4+Co5LzwFLmR1mkaD2tZhLbwVZ93CA79gelngy0PZodFM31TLgliv7OiOeKIvlnRwTrDKmLHMbqQ2u4FdB+55q2IE4DurJB8Eb+ArC8ehM3+nlWlu4OtsTGiF8rQ05A1ZGe/CXwJr0v+VGyfw9xRBbOF6u20lEye3OeRLUyWzWY3Ecg88j2rP1Vdw/PgzT1529J0JOVrYrJVChloGXmrbTTP6ySLI0ud3kKJ+CEQGJ66pmbnYZAC0eFtU5Ffy4GSdW8ENDjP5bUaeTer0h3tUccUcK0jj5Hw3TuPY6oGta2bhazsbodCXDPa5Mfg9YogWiijdnmTumsS/sj+YjOjjyIva2Gx0UbC4Bxjp25x4ZU6Xi6hLW+RcNwuBcdbpsEu8MMAwrZlutsUYYyjhDRyGnKWIKZjCGQsb6hha49fZhPkRb8OcX+hkuEj5oLfHRNdk6IwQB71hpD8o4Yxuuz3s/IuwByK4xL+/Pz9I/avT48rOTJPsDKIosIDZddmdBowSi3JRoAUOSNJHNK5qgAghhBACkEEFBIEEEnO6YxSGUlBHUKFI8pOcIZCQCkAMIsjCMID0BCYeMHdPpErcpjGGN35JWlLaMFKTAb0o9OyXp7zslDkkqEM+woMJDxhOae5DQexOhUdv+CVdeo4zuNpe/DbhQlzB3yRHV/ZJXpoYXh7orvZ4f4+sdzeXNZDXR6z+Q46HfU5e45GCNzm88EjPesMi2SLZjCcABTDTtzTsfNZ0UmS6cDIVzQEtkaQqWn5q4ovSBUMtGip5MsHepMeMqBRnIyp0fepLBM3bKZLcqQ8ZCbIwgZGe3CjV1UyhoKirlOI4I3SO9QGVPIysX0oV8bLYbNG75arx1gB9GMHJz6yAFMqrZMvDnraZ9RTmpaCKmYl+lmwdI87DHt+pcg41nvoutTR1dRIHwPcxzA442JG3uXpDgi3tqrgypc0GKlIcO4v7PcvP3Sb5/F9xMMoDoq2oa09h8/dpXlZ+N3TaOWcX9GFnbM4ai5zXjcHO4Wl4Yf8bU76eV4FTEMkfTHeoDBDWamtaY5mHD43DDh/wTVEZ7fdoKinY4ua7doHpDtC8HLBVTOetmsno3R0zA8Zw/Kq7s10kbYm/OdhbWrpoprZHMJPNeNQ727LKOEMlcY2zNOnlnbUvKcJOeimit45u34N8DVFRC7TVTjyeA9znDc+wZXHeEAR5Rn+SP2r0F0o9F/EfFHAthNohj67yqWeRsxLMMLQ1vZ4ErGWToP45oOsfNHby10ZbgVG+fcvvvxOH48Kf2zoxRNN0P1dRR3Ozy0lUaZ8sZhc8nYNdJjfw3We6fOjfjIdJ97bRWStuAqqhroZoITokywcsepWU3BnH9roLfHbrXHPIwSCXRM0lozluPbuovEvH3TxYoKFrqi5UzKU6tXUB4yNsOPaF6j9s0o6V8Hjo/4htHCVsPE3C1XTGnq5pmvYdMwBOxI5rX/C1vlji6BLzT1Ur4K6payGlgmkIkkdrHze0ABeUr10x9LlRVRzVnGNdC6RxwyPDcY8FDu1y4h4tvFNeOML5Lc5adoEIcdm75G3JQ027Q7PVXwfLNBauiuw2u9cS0UrZafW2jjY3XFrJdpJPaMqy4j4R4JtxeaWyVddUSnHWtkBAJ9Z5Ly5VXmqlmM7qmTrPpNOn7FHkv1zGcXGq3/0zvvUtSKTiegeInWrhhtPCzhOKnbO8NNQWCZ+/gCsV0kcEcPPt/xw6svEAcATrpDoZnu7guVO4lvMTg5t0qctORmQnHvT9X0g8XTW99DNxFWupnjDo3OBBCcVKxuvozHEdG2iqJaZk0VQwDLJozs4KmhdmNTKqdp1guBUKMaWZxzXQZsJx3S48ZSHDKXGMIENVI85GyR7WYBwE8YHTHzSAmqmGeDGpp0nkUARpdwfHdMAbqRKDpyUwwZJyUAAEg7JfXvZgA4Tbxh2xQfzA8EwJGt0kTtR5JdFJiSJuOUzD/WCZZs0+pLg/f4j3SN+0JDPV/D1O2o6JKB3Pq3VQH60n9q8+8VQ4rZc9jyvQfBEgd0TQM/61Vj3PC4XxkzTWT8t3FYRl+5r1/WzCXUDzU2P3iLwCcunJu2U3ECYWeAW5iwwM81LoKqand5khA7lFHJGgKLuOshkOJXBueRKW+KFw86NrvHCzsp3T8E8zGjDzjuSYyzqaCnfHljdJ8FXyUEjSXN3bjKnQ18QiLZmkO+knIpDK3TCNbnbNDRkknYADtKVgUcTA95ASZqd7TkZIXfOFfgn9LF0oYK6oistpbO1r+praxwmYDv5zWMcAfAnI5LSxfA86QHg9bxFw1HvsNczs/1AmmgPL0LnEEO7E40nWF6Zq/gb9IGkGHiHhl5zuC6Zv/0FZviH4KPS3Z6Gaugp7NdhCxzzDRVhMrgN/Na9jcnHYDk8lL2M4e7YJs78ld8K8L8ScW3KS28N2StutbDGZZKenZl7GggEkEjbJASuFuDuKuJ7nV0HDvD9fc6uiaXVUNPHl0QDtJLt9twQkBSBzs8inm775KV24c3BGxRsAJ3OEAVku0j/AFp6L0QtTw30a8e8W0Ul04Z4Tut2oWzOhM9NEHMD24JbnPMZHvSeKejfjzhK2suXE3Cl0tNG+UQtmqYg1peQSG8+eAfctLQjNoJyjp5aqqhpYAHyzyNijGcZc4hoGfWQtB0jcC8UdH19isnFdDFRV0sDahscdQyYdWXFoOWEjm07KbGZtHlEcIgT3IAXn1rX9B8ph6YeFpOX+MGD3gj9qx2cLS9Fk/UdJnDUpOMXODf+kAkkB7xYdFQzxdhSionKqyOWs/apBJUyJDcmJTzTpTEygo5t8ISMSdGlVtnTUx59ocF5AYPNbnuC9k9OEfW9Gl0b9F8Tv62P2rxuDgALfH4DNVBw3d3nAttUT/qirUcPXsRAR2yqzj+SK9C/hVw205N8oMf6wIncZcMNH+XKAf8AeBclmnY8+t4Tur26pbdVF/8Aqym/wUvLXeba6p3cBEV393GHDRORfaH9YmZeN+F2elfqTu2cU0xN2ec7xYrqyUxyW6qYWsGxjIwu6QjTBE3sEbR9QVJxTxZw9NdTJHeIJGPjaNifVhXjf3tvqCr0igOOlpJ5BbS22/hnhfg+3cRcUWo327XnL7fbHP0xRRA+m/1gg7g88AcysVI3XG5neCF0KrtFR0hcE2Ct4ekgnvlgpPIK23PeGPfGMYezO3YCOw5IzkYTSAhQcUcIV0L337osoKCztkbDUXG1uIdSufyc4tY0+PP38kV2ZR9H/EdZY6zhm0cVW2payroKisaGziF43AeGnOCCOzlnbOE/wfbJhQcSdGnFMUlgqr9BHU0MlVjSZWEYGQcHOlvI9hHNNcScK9KF1qrdBceEzLLbKJtBFNSyx9VKxp2cSXjfl2ewKgI/Ftm4fqeFabjbhCOejoX1Pktwt0zi40sp5aTv5uTjuOoEdoWTW34qom8GdGzeDquqgmv93rmV1fDE/UKWNuC1pPf5jRnbJz2LDjsSEGtb0fyksq4OwFrx9YWSK1PR+066yTs0sb9ZKANciyiyglYg8o0jO+E1V1UFJF1tQ8NaPefAIYHOOOWk8UPaBnU6VpwcfMBCr+GbmyKZ1Pb6yrjl3cYXykjbnpUjiWlutddn1bYy3W5xiwNhqPzvABaLg3gh1PG66GOKed7dPphoHf71yZ8SmjrwT6si0l2rJXFxqJcfnFSqm5awIpHvf27nKgFgpq+eldH1eHHAzlFJA+eUCMZPhzXzMrxzaPcilOKY1xYKKHgy43CGZokbAWgFoyHE4XJqRxeW5mfgN2AK2PSW18VljpsuBnmGQO0N3WLoqKrp5tEsMocWgtBackHlgL0XmeTGjPBh6TZMZUdXKHaS7HMErSUN5M/CVREYoXMgkzjQNW/5XNUlHw9e7hUSQ01BK5zQXOyNOB45VzRcC8XU3Dz66ottXT22oA89seovOcDYd6eFNs6Mril6V1BNLX18MVOXxullaBp7N8k/UumV5tsNBNUzMkm6tmCXgec7GyqOjnhqC13esrayQVMVODDC5jScuPpH2DZQ+mG8xhlPbrazqy7L5SDv4BdsI9Y2eXJ98igjJVcuZnz5Y0E50t2HuTBuAa3SAAPUqyCKeRoD9RPblOmgnfkBjifALy5zcpaPfxYo44otbZJJVSaA3rMu9HONhzWkrIKYWSprTTBtT1IhOXZ0DO+PWoHA/D92L213xfO+ki19Y/qzpz61v5OBLrcbNNdIAWUTWHrCN9sZOQvS40Gls8X8hNSloqeiaWF17kjZI1zxRnYH8oLphGV54skzuHLy+4UsszHasB4GRjljxBXZOEeLaS+RRwy4hqnej9F+O7x8F2wtHlTg2rH+KYDMYNJ5B2VzW+WCnnrHGormRsYflGMbl2/Z4Lcce3f4pgbUuDTpYdOrkTnAHvXJbve3MtZq3PLnzvc/JO7t8Z9uPcnknSM4xNFS3OhscJhtUMdLj0pc+e71nmqmu4hbI4l9USXdpfnK57WXKrqpcueQ3Ocdy0Vs4vtFLSR20cJU8kkh6vyiWXU7U7bV+3C5Y9mzQsxh0ilxjDdlFpWglvbgBWcce3JRkYCYXHfKW5zspTGaSSiI5rBsTCBORurKiJ2VZgnGFYUWRjKcRMvKZgOCUuswIiQd1Hp8hqTUv+TOVtQIqatx1EKBKdyplU8ZKgSvCzoEILu8oichNufugHbHdaxJZUX7aF3qP2LjZGXuP5R+1dhvzwIXeorjfWee7f5xXo8UVCi0hANSmuB7d0YPau2gCDSBzKTjxTmUWB3JiAAMIFBDCBhjdHhEEYSYMCCCCkkIokC5J1+CaKFIZCLV4JBdumKxZ3RgDtTQlwj15RYx0EYRghMailNeBzU0SPoiMpOdkA7wTGwYHcjwizsic9oCQBuOAm3yANwOabfJnkkbnkU0BIp3F3NPhoLhvhMRN0jxKW2TBwRg+KdjJ8EhM0FOwF+uVjAOZJLgBhe+XNLMRnPmANwfAYXmj4NfRxPcr1Hxde6PTbqI6qOOVuOvm7HYPNrefrXpckucSeZWMyZBt5J6MJto2S2lY2CJcBGR61b0h3VJBnOVb0L8uAUspGho48sbgqfEMc1EpMNa3bsUxuNipLTFOOyZcd067lskFm6RRV8RXinsVqkuFSC4DzWNHzndgXIaWW58VXuU0kRnqpn5kf8AMhHifAdi7XXUVPW0clNUxMmieMFrhkFRrVb6G0ULaO30kVNGOYY3me8ntUyjZMiPZ7fDbLfBRRb6ANb8bvd2krx5PPHSdNfGkkrI3sivMh0yDU0ZGQcete0H7FeJuI2a+ljpBe0nLbo/7AB9ZCKpUTRreIOFDXMp7xHTyte5oNRVUwAZqPLLTyUSLhW7SwmohY6YxgkP6otyB2rv/RTTUNdwZPT19Kw0tSxsLopcHWAME/cVxvjvg+9cJXSamprhVOt7svpZWSuAMeeR35jkV43P4kIrvRjKGygZNXmndTGWBr27aHSKsmsddLJ1pgZI7mBBINY9QT7RVGQMkmcXPPpZzuri0vuNJUPkkldGYWlwdjBGN148Fj9JcSvvV06RpfJ32/ii7xxUsTYzSh/Vlo5DIx9auqJ3TNFbI5DPdTNJgAula4OaRzyo3X8V3/isXGKqmqzT0rfPEQIwd9LsekMd61lznu9x4UmFnuFXS1dO3BpY5CAHcyBnkCNwvpuFP9E/o0jKjPWaDp4L3eUVNEGE+aahrXAfUrynj4qp6h0XE1VYerecvMJ0YHvXKK+n45q3vM9Zf3tG7mukfge5UlfR1JqWSVsdWSMAmQuP2r04vsjRssvhMUfDdJarPNQCnluM9W/VNEP4sN3BI574XGorjMxnml2B3rrPSpT6LLZZ5GAwQF0fLk5wGPsXOKp1L1ezW59S1jVEOyF8b1bsAaSlNr6px3A9yejkiA2aPcg6aPsGPYq6iIdS6q1Z1HdEI5ZMAv8ArT9RLrIwFH1u7lVgkIY1udzkoPcByScEJBJ5KaGLa4OPNODkFHYMOynCTthAIOV0jHNfG4tx3KXBWCVnVzgesqA57u1Muc4EkHCaAeuIDZHNHZyUMHCU57nHLiSUg4yhoAwNTk49mCCkM55CfyHFoPakMaZzKVEcOae5wP1p6SndGHHmo0JwT2p2CPUPClWIujCBgO5rqv7W/euRcZnNVITzK6HYZ9HR9TM1cq6pz7Wxlc84nw6d57yVgo/tZo5WqMJcwDG09oJTMA/c7T2KTdwGsHrKjRvxSMB7zhbGVCkETfRJTcZ1PKAYt/NKadkYaET2tHaigFy4LFs/g+UjK/px4Lo5T8k68wOc3sIa7Xj+qsQT5ucrd/BwnZD098EvkOGm8Qs9rstH1kIa0M+obeS5z029LNo6KXWGpvtDUz2+6VMlPJNT+c+nLWh2rR84YzkDfuyujjkFw34WfRXxH0rUfC1psL6WCOlrpZaypqH4bDGYwAdI3cc9g945rJDOr8GcV8PcYWOG9cM3WmudBNkNlhdnBBwQ4Hdp8CAVdP5ZXK+gnoO4V6JoZZ7XLWV92qYxHVV9S/GtuQdLYx5rRkeJ8V1R/LCAPAvR/do+A/hr1rI3tiop+IKu2zBxwNE7yG59Tyw+xdRisU3RbY+nfiOlhPlVxuYoLQ1gyS6oaHMDR366oD1sXmjpxryOnDjOvpH4fHfaiSNw7HNfsfeF6w+EZxHNV2PoebJExkF+4it1bWtYNnaRG/HiMv8AqCbVCOSf+i3UaXWGLj61P41itouDrH5O7AizpA6zP0vNzjGcHGFhKboiqH9Al26Up7x1D7dVSUz7Y6myS5krYzl+djk93YvVNGHH4dlaWHYcIN14PZ1jOftwsDxGxrfgbdI7YsaBxNX6cbjHlzUDIvR/wfxR0QdMfRrw1T8eXCvsfEstTVz2+NphgBEGTqbqIcSdPd6ITHG3CHFHTH0udJvDtZx1X0Vl4WqYqqnoJGmaHLonY0t1ANxpd+kV0PpKGfhC9BB/6vV//pgovRR/9vfT+f8AR0/+6kQI87WTokdS9EfDPSyb617a2800At/k2NH7q0Z15/Izy7V6E+EL0OUvSp00Rw/htbbRcI7C11Nb3QmWeUMkfmRwyA2PL2jO5O+2yx1IP/5G+Bx//wBDTf8A6563t2cR8P8AtIAcdXCbgcdm8u58NvrCGM829HnQhPebVxNfuL+JqThSw8N1rqCtq5IHTuMzXBrg1oI80FzRntLsYWf6dejKu6LeJ6W2zXOG7UFwpRV0FdEzQJYycbtycEbcjgggr1Dchwm7oF6XDxW28CwfhtWeVfFfV+VfwmDTp6zzfS05z83K4p8Lzi+DiuPgmCj4Y4nslLbrc9lO+90rYTVRuEWl8Za4hww0ZI7SEeiOEaxhXHBMvVcZWOYD0LhAf/ECpA3bGFP4fk6i/wBuk+hVROPseCqSEfQuZwFS7/WftT55KFK7Mgee0g/YpjuaiQA7eaalASyU3KdlA0YrpeYH9Hd5aByjY73PC8XSDDnDucR9a9s9JjOt4CvjccqUn3OC8UTj5eRvdI77Vvj8BmscImDJjafUEYMLuTB7kjAMe6XABkjTt61xFhSNY2MPbEHEnHJIwADnDf2Kwp4Q+JrXscW9bg6cZ35c0xWU7WSyMwcAluCd0Aipu1MGOiLXB/ntBd3gkL0DjDQ3HIBce4Ts9NfuKLXY6mR8VPV1Ajkcw4c1uCTg9h2XV7xw5DbpxRuvda5jRiOUTty9vf61cfBMlYPcUQY6Ods8T5YZm7NkicWPHtG6ojYaM5J4hupJ/wCtj7kBYqAbG+XM/wDzitCNFcKivuTWNulfW3AR50CqnfLozjONROOQ9ydiuV7ihEEN+vMUIGBGyvlDQPUHYWZbYbVzdc7i495r3IpLFYiAJLhXe2vcmBeNi0uc46nPccuc45cT4k7o8HKoG2Lh8OBFbWH11z058S8P9tVUH/51/wB6NiouzjvC33B9E6lszHvGHznrDnu7PqXOeHeFeGK+r1TySCmjPyh8qk84/RG62bOHuDcDE1Q1o+aK6QAfWigNX2ZyEkuHePeswbBwTnznyO9dZKf2oCxcDfQB9dRIf2o2Iv7hWR0kOofKSO2YxpySVR0VNNcKwTVkgcSfNb81qy3EFRHZb6ZOHaBj6Xyd0biHOJc8DV2nPgmuDOMr7XXaC1/E2p0j9LJHMILSd90paKR1I0VIymMUWZZnuGp+MNAHYr7geztqWVNVWVrKWkgeWSN1AFxAyfUFmXWurfC2orpo2StkLZIgXBzB2EdhUi+XG/UNDHZ7I23V9rfCDL5TFiXUfSbq/aoVXstWQOK5eGam7SeTQBkUeRE+M4c8d5Pas3N1MJ6ykEzQORLt07WUN1mm634vggAaBojfnkqqeqkGpjmOYW7Edy8D8glHJpHs8SVx9MBx7dZpuIo6JwB6iME+tyrKevq2Vbp2zPMjMaXE7jHLCVdB5dxVXVz3ZaXBjfU0JVHTxO6wufpydkY0lA6qdi579cHSyPdO9zpfTJccu9anScW8RTWxlC+8V5pIR5kQnIa3HLCqhRx6zh+RnAU6itElZVxUNM3XLMdAH2rXC9iypOOzpVuhuFHw7Ey11Ukb3NE2Xbue9wBJJWIqRJV3KSW5O6yd27nO710O7Xaq4ctcT56OlYxjRHEDkueQAMrlra2SorpKl8ZJkJOAF0clqMTm4UU8rZv+E+FPjSPXC2CIEenIBj61B4ssJs7wXXShmfqwWU5GR7llpKypaNLS5o7slQJat73O6yVrGt3JXNhlja/2d+SOW/8AR0XhCerrW1NDHPLMyKHrQC8lrN8cvFa+C23Wx0sFbeJKn4onnY2emleWRSAjtaNyMLMdH1tjouHWXSoe4VFX8sPyYx6A/b7VA4p4yrbjVup7vfKiWKN3mRsgGGL1cSqNng8jJ+7Ru+kvgjhiT/JUkUYqYOuijiI0g+HgVwy4PrrS0QU0TvKIp2GMNduDnYjC1j7sK23yupZqsCKEhrpHAHA7scli7BWartK5rHhvXAgPdqI7905Mn5KRp+mG/U12s1nZBIOukBfUNAOGEDce9c74szG2kpG8o4W6vWRlabpJnzarPNpAbE6eHI7TnIVHxpHprmPxs6CNw8ctCze3Rj4jNQRkxueT2punGbrRg9s7PtUuIfuc4553UWm/ytRjP8e37VtGKohSbOhUR5Z7lZse0dqpqZ+MKax7SOa4cq2WmT9bT2pJI5qN53YUMuPMrKgJEZBKsKTBbvzyquNysKTluqiiWXMTjp9aYq3eZ3JUf73sVHqh5pyVoK6KqrO5UB7tyMqXVEAlV8p54UDQh53SdZA5pD3JJOy0iSypv0nyDieQB+xccc7z3Ecsn7V16+EmGUdmk/YuQ7bkd69LjIQtryE4XnCZAOM9iPdddgPNee9Oax3qKXEJIe7uRYE0HPajyO9Q2yOGycD+9HYKJAI70oclGa/dLD0dhMd3ROOEnUkSPyUwDc4d6Rq3RelzCGFNgG0on5wjAwgcHZMBAHelN5oEb4RgY7EhhhLa0bpIBPIEo3nqxl2R6xhOxUL1DvTckjQfSTMkhJ+iEkNJI2RYeinzOIxnCNjHSHmU5HDk5Kf2YNkCoabAO07p0Ma1vYkmTuQYCXZOUFUKiB1ayrvg29R8PcS0l2mt1PcIoXefBMwODm9uB3qnQQB7ks3GfCdws9JW0t5t8EE8LXsjfM1hYCPRLezHJSW8TcNn/wC8Fs/2pn3rzx8Gm4cH1dVVcL8T2W3T1EhM1BUTRanP28+L19o9q7sOHej0f/du1/7GFhJOyGWI4r4XacHiK1/7S370f4X8Js3dxHa/9pb96gNsHR8B/wA27V/sQS22Ho+/6N2r/YQoUQtllFxpwftjiW1j/wCZarOh444KYRr4ptQP/aWrPCw9H49Hhu1Z/wCwtShYuAmguPDdqAHPNG1DiHY3lP0j8BNGl3Ftoz/2lqmN6R+A9P8AzttH+0tWAjsnAukOj4atZyOYoWqVHY+Ccf8ANu1/7CxS4MtSNqOkjgQf/ey0f7S1D/CRwIT/AM7LRn/tLVkGWTgz5vDVr/2FidZZOEcYbw5ax/8AJMCnoyu5qXdI/AbR/wA7bR/tLVHk6RuBHHbiy0f7S1UjLNwpj/m1az/8q37k6yz8Kh2PwZtf+ys+5Diw7WXUfG/CNSGGDiK3yBx2LJQVwKLhiOt6VL9LC7ro7pdX1Mg74x5rQPWQSu1NouHosNi4ft8Yztpp2j9i5vDNJT9KV5dTN6qFj2mLTtpOOX15U0DZ1/hiwQ2unja5ga9jdOAdgpfE1jt9+sc1sq2lrXglkjdnMd3hZum4orjTiORzJXO2c8tDXAKZJxDVxPZ1YbKzTy0glZ5YKaplUmjgfElgruH75Lb62IsfGdUbwMh7exwUykuclfa30k8LXVrm6JTjZw7x3bLUdJtTJc+IqGoqXxRkUjhpO2rDuQUGx2U1UbpqVsYLSOtLuZBPYvCzfjpqVx8DGo3spr9xLcrfV07bZRw2eN1OYs0ZPyrRth2e1o+1RuFLoW3ASaXt69umpL5dWt2dn78lurzwEXWdkMdZBVVLnunhfEThuRgsI7Mj61kLfYo6bBqCCQC2SIHS9nvXrcWHXHTFlgktEW7cWcQcK8RVDKSaOogmIzFPGMGM9gI3VXR8QTzXltXNTMjpNREkUQBOlwwd3c+9auSyUfEPWCpjr/K4YdDDTxiUZ7M4WEqbJU0VS5k5cHt2c3BGD6iu7E6Mt0X/ABfw1TXiwVFAyRsjJItcEox6XYfevNtbSup5HwysIkjcWPGORGxXpvhOnqSGRSn5F2C3wHcuIdMUIoekW708bA1skjZsY7XMBK3S2CZinsOMgJiTI5KY7dpyor/SVgMtdvvsg5xGSEH4yiG4RYDbyUg7lLcEhFgGCAiygjcBjYIBCSNk2lv5JCAEFnckEc9k+04KDmB2O8oGFTRdYx5HNvYg+N7WZxuE7RNLXSDwUqPHm6hkdoQA3UP/AHM3PMhVsfmkq1rNJY7QwtaOWVVuGASgDvljJ/AZgON6+bHtijKxPETSXuJW34cZr4CjIOcXB/1wRrIcSM0l3io+xowN6b8hn8pVu3kzCM+kVb3sHyTIx6aqm/wZv5xVkhxuy07Z3Rt0h+W7BIZs0+tKZkJiFF+/NNyOyeaUcEpuUAckr+himnZTLHc6yy3uhvNvlEVZQVMdTTvxnTIxwc047dwFBYdkWd0wPbvDXw0uFZKGFvEfCV6pa3AEpoXRTQ57SNTmuA8MErQxfDD6KnM1SUXE8Z7jQsP2SLwC702px4+TB71PUdnvef4Y3RWzHV2/ieXPPFFGMe+RZ7iv4aPDEdvmbwzwneKquwRC6vdHDED2E6XOcR4bZ8F4lykv5JdUFk2urqq5XCquFbO6apq5XzTyHm97yS53tJK6P0i9MV4424T4T4eqbbR25vDLWilqKaR5fIWxtYHHOwPmg7dq5czkhIdlQHpNvwqeIvJJK8cH8PDiqSgFC6+jUJTGMkHRjnqOrTq057MbLJdGXTjeuDOBrrwhUcP2fiK3XCodVabmHPDJXYLi5o2kBc1rsHG+d91xhsjmnnlPx1GdnBLqgs7PdvhB8T3TjDgrii42m3VFw4UjlbGdbmtq3SM0Oc8Aeb34bsk8I9P/ABFw50qcS8cw2W21DeJMCvt0j39X5oAaWv55G/MHIcRjkRxp8mHboNkBG+yOoHY+Kuny+8QcFs4Ul4cslDb4LpDX0kdGwxMpmxPDmQMY0Aacg5J3JcStI74VXFH4TV/EbeDuFxcp6JtJTVDonGWlaCSQJNnPYXHVoccZHPGy88l4RhwPaikB1Do16Zrxwnb+ILRdLLbOKbNxBM6prqC45DHTOOXSAgHGTjIx2A7FU/TJ0l3rpP4lgu92paShhpKcUtFRUgIigiBzgE7kk8ztyAAAWHyO8Iah3ooQaVRkx10Eo+ZK13uISNQ70QPzhzTGfQtztVDHKO2FjvqaVZHGSqSimEvC9LODnXb4njx+TCntrMxtJgeSWg8x3LJiJbxsm3YIwmfLQBjyaX3hJdW5z+5pBjvIUDRU8X0Ulfw1daKEAyT0kjGA9rsZC8T8S2yss91lpq6B0L3EvaD2gle5pKsnOaZ/6QXIOmPo/wDwuoYHWqjhp7nBMA2eeTA6rcubt4kK4zobRxeNmpjg7s5JyJocGu7NiUhowXAI4tocLnRRNr3tNI0RsGkuycKFOXCZ7fBqkVO1CwepMzb9Ye3WPsQ1sRo+iq3V9bxtRVFJRzzQ0pe6WRjCWsJjdgE+OV1+qsE9ZTiGeglcMD5u4PeCuadFt9uVoobmyhmDGy1TS8EcyGLWycZX7P8ACW+7/itopCY3cODLzBqdT0U08f5LfOA8R2qnfaq6JxbLSSscOxzcFWs3Gd//ABoe5MTcYXyQASTseO5zM/atKQiA221B/iHe5OC11J/iD9SedxVdQCcUv6gKK7i27E5/co9UISpASYbFcah2iCjlkd2Bjcq5pOj281MDxUsdSamkN0kF4PYfBUDeNeIGt0tqmtHcG4RS8b8QjYVY93/FPQjotBw1cqejihkga5zBgloDQfYpg4euBZtSj2uC5V+HHEX42Pckycc8SDGK4j2JMVs6x+Dtx/Fm/pBG3h64Z/eW/phchdxxxIedefcmJeNeIufl7soQUzV8ZUVwjt9a+nZMfJ5nh8kXzDywqrgGsktvE1FV1FY+HqnF7nveXAHSV1Hh5ok6JqKok8+SphdNK4/OcScrnFVbaWOdzomuZluSAdlxyyftRvGGrOnX3jKjrIInPu8Y08y2PJKiUt+t0sIPx1Ec/kELlLaaNsucu3Hen2MAAA5BaRf2NxdHV4b1bWHMtzge08vOI3Wa4zrKFtqq7nDWUskkcZL2sfu7sCwlSMjmfeoF4aG2aoIzywseRjhkjtGnGnKE0hmGSgZbIaltYX1EwcZYtGCzfv7cqayt4cNlpww1kdyDyJi8gxOb2Y7crON/gbW9g5J3qWeSl2N15Ok6Pe21Z0mz2fhiKktFzuNybLRVcgbMIyBJGc4Ix4d66bS0nRjRXeOaw1Ur6qIFsgccAZ2yM8yvMUL3NiOCSM8itXwNVT1Uk1LUPMjGTRSMJPnMI7iu3jdf6OPkp1dmu6Raz4zu0xdqbFSksZGewA7n1lYuWsfFkRsDAOSRPX1dXea+epqHyyTTkvc489/+CauW2Mdy4OZNylR6HCxqESFW10j5C9zzv2Jm3w+W10FNJLoZUSNY53cCcE+5RqgZLskqdTtEdZThvr+pRx4UbZ5VFnaZ5aF1KIKG4PmbE3SGEYAa3Ax9i5lxLA43Kd2QBq3AUnhKeU3+njLzpw7b2JfFjGitBGxe/de5FfqfKy3Kw+FXdbSzxOxpdG5uBzVTT0TKO9zNa4ka2kHxV/w5GyNjdDceZIf6qqoBrqusdu4uycqZMH4J48pXydHrKsDJgrRJ6muyCqfixpqbRaq4EkSU/VuOOTm/8Ctl1EdV0Z3SKYFzXMnd6i0kjHuWWszjVdHMrJ8O6h1PLGe1pcC13sIAQ1RneqMjANMbgVXRv/xtSnO/XN+1aGphjb1gA7Fmaf8AyzTjs61v2rZLRETfROw0nKdZKQRuoo9BBhIcd1x5P8jRFm2c45/WnWy5AVcwlSIye9ZVQmywiep9I8nAVVEeSsqNNAW8T8MTFW7zSlR+imKn0VbEyqqidRVfKVNqSdRVfOSpAZe5Ic/bmiedymictKuCBldeXaqeUZ+Y77CuRxnYDHYutXIAxyfmH7FyoANzgdq9DjuiGy/tPDEldb4qwVcTI5BkftUiXhuhg8193Y89oY3JT3AWJaG5RzNbIyHQ+NjhkNLiQ448cK9ZDF1esRMB8GqcmeUZUjvw8aM42zGMtFDVT9VTVrsjOS9hGMKQ2w20GFjq+aSSUZaGRYB96vbjUTMh+Sf1eORa0A/Yo3Xv6oPfiR2Ob91LzujZcaPaiMzg50rvkZ9IAyQ9wLvcE5DwnG1rHu8qna75zQGt5+KtbY+SaAF0jmEfQw37E5Xk0+Awlx5ankuP1rGXKkjuhwMb2Q/wPovKGx+URaS0uLhIXEeBwmncM0kTS9wiYwEgGabBODzwpULZqiXq31lS1pHJjg37Am/iulM2qTrZXb+c+QkpRzTlsWTiYo/RBqrFb25MFQJ3kZHV+iFXw0tGHiknYwzknS8HY+BV1VUMHUP1dY4N3AMjgPqKpKw00L9TKGnztz1H9q3jkkzjy4sa8Q5U21zPlIoW6QPOZjdNwtgqGaYoGmTlpEQz9qm2e6zuhe7qoAWea06OQ96butc9pjmZT0zXyekREN9k1mdhDHBeohGhqWOcTAQBzy3kpFKYgNLo4TvyLN1d0Gqpi1yOwcfNa0D7E5VNlg0iKoe0O2OGM7vzVXytmqx44u6K5lnrap+Y6BjW/SDcKQyifb/3ynaDnBLowQriwVVY+hlmfVzOc3A5gA+djsC0baZjra+oc+RzmnYF2yl5pItwxXfUyEVnhqQJPjW3U5Iz5sZyPqVvQWumaWirvlDWMbgtbJGdj7lem2Uj6CiqCJA+ZrteJCBscDYKh4wtcFGJ/JpamMswQRM7uUvJJnFOMW9I09VS2a62w0VdNaepHZTwfKH242XN+L+BJLU41loFTUUBGflo9Lge4D53sUKmnnfs+ondv/KH71Nkv92po5KSCska3SAJCdT2juDnZx7FEMk4vbE8MZLRj3PLCQQWkcwRuE06TWcBXtfSRVFJJUzOe6bGovJ3cfFUdO0br0YS7Kzjnj6sVFH2lSGgAIgMMCGdkyLoPbvRIkEAP2+sqrdX09xopTFU0srZonjsc05/4L3FYbbU3uxUN4pXUograeOdnym41NBx7F4ZZv2Ba/g7jjiaw1ENHQXObyV+xgkcXMHqGdvYhoiXp7F/B24cuto8f61GOHbgOUtH+sXDouKr7JHG810gLm5IBTg4nvmT+75Pes+yQlFnbxw/cBzlpB/3iRW8MVVbRy0lRNRuilbpeBKRsuIM4qvxfj4xl96dj4pvuvHxhL70rQbR3KmsFdTwRwRSULWRsDWjWeQT7bRcx/G0efzyuIR8UX0yAfGMo27CpA4lvgftcpvem2g6s7WLZdOyah/TKW2guwGOuofeVxiPim+9lwk+pOjiu/jOLlL7h9yXZFdWdl8ivAGBPQfWj8kvP8vQe8rklPxLfX4LrlN9X3KYy+3l2nNyqN/EfclY0mdNdS3sDaooB71gqyOaHi+5tkcwzGYF5byOWg7KI29XfBPxlUZHiPuSbBUTVt5qZ6l5kldJhzjzOAMLOTHRpqJtVMSx+BH2FWFPSB7WGN5OeRDkIomt0YzvzVvRxMbCNLQMdyxkzSJzXpLonG+0zBIWGGBhJ1c8klaLg5zaa0ySvIdl42UDpEpYZrnHNI3U8sDTv2DknbUwNoGxNJDMZwml2WyfGOQ32opq2WGPrNbXnBadsHllQOIHvzT1DKuOYzt+VaObT2gqbTUUMl7ha7UBIW6sHmqm4UkTJ3ubqzg9viuXFay9TWe4WVdHc622V4qqKZ0MoOCWkjUO496HEF8qeIqtlVXRsdMxmgvYzSXDx7/WnzG1ukgb5SZWtwTgZwvRUUjnsm8OwHOotw0ABcO+EVCGdKFXgAB1LA4ePmr0ZQxRx20Oa3Bccn3Lzv8ACRcT0mOB/EIPsK0TsEcyIcBy2TTm6twn3OIGMpHYnYEORp3SGqRPyTDuaq9CEOTbuaWUg80IYEonzUSV2BADZGUgDJwnXAYKQztQID2YGUgE55px5OnCYbs7CAHmmTUS0gHCdbLM2M6huORCZaSE845g3QAuuqX1nyxLWEMDdDBgbDCr3+ifUlOyBsSiG7TnuKYI7/wE3ruBpWbksrm8vGnb9yzPGcGhpO4Wn6KTr4Rqmnl5TAf/AO3Cq+kWNrYzgdqy+yjk13z5G7P01WRn9zepys7x/B5B+UqkfwX+ktCQwcoE4KTCkvJyFQDmUTsEIwidzSAQchBo3SkEWKgnbkFKcTpA7kk8ko8kDG0DugeaCYvBTUUh2RIn8lNDsRndORbuCbanIvTCAHKgec0+CQCcpdRzb7U2OaYhbzyRgpL+SNnJAw0eEXaj7EAAo8nkkowgD3rwfJ5RwBZpD8+1RH1/Jq2oWTT0dPNhrRJEx2O7LQqHoz8/o34cDt822PP6K0lm3s9Dn8XZ9ixYBmGXubn85IMMvc33qYklSBB8nmdtpZ71Amo5esOdHqyrzG6i1DQZCUmUj//Z');
                background-size: cover;
                background-position: center center;
                border: 1px solid var(--line-light);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                box-shadow: 0 30px 80px rgba(0,0,0,0.4);
            }

            .vsl-frame::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, rgba(31,38,45,0.15) 0%, rgba(31,38,45,0.05) 40%, rgba(31,38,45,0.4) 100%);
                pointer-events: none;
            }

            .vsl-play {
                position: absolute;
                left: 12px;
                bottom: 12px;
                z-index: 30;
                background: var(--orange);
                color: white;
                border: none;
                padding: 10px 16px 10px 12px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-family: inherit;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.02em;
                line-height: 1;
                white-space: nowrap;
                transition: transform 0.25s ease, opacity 0.35s ease, background 0.2s ease;
                box-shadow: 0 0 0 0 rgba(255,87,34,0.55), 0 6px 18px -4px rgba(255,87,34,0.55), 0 2px 8px rgba(0,0,0,0.25);
                animation: ringPulse 2.4s infinite;
            }

            .vsl-play:hover {
                transform: translateY(-1px) scale(1.03);
                background: var(--orange-deep);
            }

            .vsl-play:focus-visible {
                outline: 2px solid white;
                outline-offset: 3px;
            }

            .vsl-play.is-hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(8px) scale(0.95);
            }

            @media (max-width: 600px) {
                .vsl-play {
                    left: 10px;
                    bottom: 10px;
                    padding: 8px 13px 8px 10px;
                    font-size: 12px;
                    gap: 6px;
                }
            }

            .vsl-play svg {
                width: 18px;
                height: 18px;
                fill: white;
                flex-shrink: 0;
            }

            @keyframes ringPulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(255,87,34,0.55), 0 6px 18px -4px rgba(255,87,34,0.5), 0 2px 8px rgba(0,0,0,0.25);
                }

                70% {
                    box-shadow: 0 0 0 12px rgba(255,87,34,0), 0 6px 18px -4px rgba(255,87,34,0.5), 0 2px 8px rgba(0,0,0,0.25);
                }

                100% {
                    box-shadow: 0 0 0 0 rgba(255,87,34,0), 0 6px 18px -4px rgba(255,87,34,0.5), 0 2px 8px rgba(0,0,0,0.25);
                }
            }

            .vsl-caption {
                text-align: center;
                margin-top: 18px;
                color: rgba(255,255,255,0.5);
                font-size: 13px;
                font-style: italic;
            }

            /* Hero CTA */
            .hero-cta-block {
                text-align: center;
                margin-top: 36px;
            }

            .btn-primary {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: var(--orange);
                color: white;
                text-decoration: none;
                padding: 22px 46px;
                border-radius: 999px;
                font-weight: 800;
                font-size: 17px;
                letter-spacing: 0.01em;
                border: none;
                cursor: pointer;
                transition: all 0.25s;
                box-shadow: 0 18px 40px -10px rgba(255,87,34,0.55);
            }

            .btn-primary:hover {
                background: var(--orange-deep);
                transform: translateY(-2px);
                box-shadow: 0 22px 50px -10px rgba(255,87,34,0.7);
            }

            .btn-primary .arrow {
                transition: transform 0.25s;
            }

            .btn-primary:hover .arrow {
                transform: translateX(4px);
            }

            .hero-cta-meta {
                margin-top: 18px;
                font-size: 13px;
                color: rgba(255,255,255,0.55);
                letter-spacing: 0.02em;
            }

            .hero-cta-meta span {
                color: var(--orange);
                font-weight: 700;
            }

            /* Trust strip */
            .trust-strip {
                background: var(--charcoal-deep);
                padding: 26px 0;
                border-top: 1px solid var(--line-light);
            }

            .trust-strip .container {
                display: flex;
                justify-content: space-around;
                align-items: center;
                flex-wrap: wrap;
                gap: 30px;
                color: rgba(255,255,255,0.6);
                font-size: 13px;
                letter-spacing: 0.04em;
            }

            .trust-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .trust-item strong {
                color: var(--orange);
                font-size: 24px;
                font-family: var(--font-display);
                font-weight: 700;
            }

            /* ====== PAIN SECTION ====== */
            .pain {
                background: var(--warm-white);
                padding: 110px 0;
                text-align: center;
            }

            .pain h2 {
                max-width: 880px;
                margin: 0 auto 22px;
            }

            .pain-intro {
                max-width: 680px;
                margin: 0 auto 60px;
                font-size: 19px;
                color: var(--charcoal-soft);
            }

            .pain-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 14px;
                max-width: 880px;
                margin: 0 auto 50px;
                text-align: left;
            }

            .pain-item {
                background: white;
                border: 1px solid var(--line);
                border-radius: 6px;
                padding: 22px 24px;
                display: flex;
                align-items: flex-start;
                gap: 14px;
                font-size: 16px;
                color: var(--charcoal);
                transition: all 0.2s;
            }

            .pain-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(48,56,65,0.06);
            }

            .pain-x {
                flex-shrink: 0;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: rgba(255,87,34,0.1);
                color: var(--orange);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 14px;
                margin-top: 1px;
            }

            .pain-close {
                margin-top: 40px;
                font-family: var(--font-display);
                font-size: clamp(22px, 2.6vw, 32px);
                font-style: italic;
                max-width: 720px;
                margin: 40px auto 0;
                color: var(--charcoal);
                line-height: 1.3;
            }

            .pain-close strong {
                color: var(--orange);
                font-style: normal;
                font-weight: 700;
            }

            /* ====== AUTHORITY / GERMAN ====== */
            .authority {
                background: var(--charcoal);
                color: white;
                padding: 110px 0;
                position: relative;
                overflow: hidden;
            }

            .authority::before {
                content: 'GR';
                position: absolute;
                top: -40px;
                right: -40px;
                font-family: var(--font-display);
                font-size: 400px;
                font-weight: 700;
                color: rgba(255,87,34,0.04);
                line-height: 1;
                pointer-events: none;
            }

            .authority-grid {
                display: grid;
                grid-template-columns: 1fr 1.3fr;
                gap: 80px;
                align-items: center;
            }

            .authority-img {
                aspect-ratio: 4/5;
                background: linear-gradient(135deg, var(--charcoal-soft), var(--charcoal-deep));
                border-radius: 4px;
                position: relative;
                overflow: hidden;
                border: 1px solid var(--line-light);
                background-image: url('data:image/jpeg;base64,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');
                background-size: cover;
                background-position: center 25%;
            }

            .authority-img::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, transparent 50%, rgba(31,38,45,0.85) 100%);
                pointer-events: none;
            }

            .authority-img::after {
                content: '"Un equipo de profesionales trabajando contigo todos los días."';
                position: absolute;
                bottom: 24px;
                left: 24px;
                right: 24px;
                font-family: var(--font-script);
                font-size: 26px;
                color: var(--orange);
                line-height: 1.15;
                z-index: 2;
            }

            .authority h2 {
                color: white;
                margin-bottom: 22px;
            }

            .authority h2 em {
                color: var(--orange);
                font-style: italic;
            }

            .authority p {
                color: rgba(255,255,255,0.75);
                font-size: 17px;
                margin-bottom: 18px;
            }

            .authority-creds {
                margin-top: 36px;
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 24px;
                padding-top: 32px;
                border-top: 1px solid var(--line-light);
            }

            .cred-item strong {
                display: block;
                font-family: var(--font-display);
                font-size: 32px;
                color: var(--orange);
                font-weight: 700;
                margin-bottom: 4px;
            }

            .cred-item span {
                font-size: 13px;
                color: rgba(255,255,255,0.6);
                letter-spacing: 0.02em;
            }

            /* ====== SOLUTION REVEAL ====== */
            .solution {
                background: var(--cream);
                padding: 120px 0;
                text-align: center;
                position: relative;
            }

            .solution .eyebrow {
                color: var(--orange);
            }

            .solution h2 {
                max-width: 960px;
                margin: 0 auto 26px;
            }

            .solution h2 .accent {
                color: var(--orange);
            }

            .solution-sub {
                max-width: 700px;
                margin: 0 auto 70px;
                font-size: 19px;
                color: var(--charcoal-soft);
                line-height: 1.6;
            }

            .solution-badge {
                display: inline-block;
                background: var(--charcoal);
                color: white;
                padding: 10px 22px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                margin-bottom: 30px;
            }

            /* ====== INCLUYE / VALUE STACK ====== */
            .includes {
                background: var(--warm-white);
                padding: 110px 0;
            }

            .includes-head {
                text-align: center;
                margin-bottom: 70px;
            }

            .includes-head h2 {
                max-width: 820px;
                margin: 0 auto 20px;
            }

            .includes-head p {
                max-width: 620px;
                margin: 0 auto;
                color: var(--charcoal-soft);
                font-size: 18px;
            }

            .includes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 20px;
                max-width: 1100px;
                margin: 0 auto;
            }

            .include-card {
                background: white;
                border: 1px solid var(--line);
                border-radius: 8px;
                padding: 36px 32px;
                position: relative;
                transition: all 0.3s;
                overflow: hidden;
            }

            .include-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 24px 50px -15px rgba(48,56,65,0.12);
                border-color: var(--orange);
            }

            .include-num {
                position: absolute;
                top: 20px;
                right: 22px;
                font-family: var(--font-display);
                font-size: 80px;
                font-weight: 700;
                color: rgba(255,87,34,0.08);
                line-height: 1;
            }

            .include-icon {
                width: 56px;
                height: 56px;
                background: rgba(255,87,34,0.1);
                color: var(--orange);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 22px;
            }

            .include-icon svg {
                width: 28px;
                height: 28px;
                stroke: var(--orange);
                fill: none;
                stroke-width: 1.8;
            }

            .include-card h3 {
                font-size: 24px;
                margin-bottom: 12px;
                color: var(--charcoal);
            }

            .include-card p {
                color: var(--charcoal-soft);
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 18px;
            }

            .include-value {
                display: inline-block;
                background: var(--cream);
                color: var(--charcoal);
                padding: 6px 14px;
                border-radius: 999px;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.02em;
            }

            .include-value strong {
                color: var(--orange);
            }

            /* Highlight card */
            .include-card.highlight {
                background: var(--charcoal);
                color: white;
                border-color: var(--charcoal);
            }

            .include-card.highlight h3 {
                color: white;
            }

            .include-card.highlight p {
                color: rgba(255,255,255,0.7);
            }

            .include-card.highlight .include-icon {
                background: rgba(255,87,34,0.2);
            }

            .include-card.highlight .include-value {
                background: rgba(255,87,34,0.15);
                color: white;
            }

            .include-card.highlight .include-num {
                color: rgba(255,87,34,0.15);
            }

            /* ====== FLEXIBILITY CALLOUT ====== */
            .flexibility {
                background: var(--charcoal);
                color: white;
                padding: 80px 0;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .flexibility::before, .flexibility::after {
                content: '';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, rgba(255,87,34,0.1) 0%, transparent 70%);
                pointer-events: none;
            }

            .flexibility::before {
                left: -100px;
            }

            .flexibility::after {
                right: -100px;
            }

            .flexibility h2 {
                max-width: 800px;
                margin: 0 auto 20px;
                color: white;
                position: relative;
            }

            .flexibility h2 em {
                color: var(--orange);
                font-style: italic;
            }

            .flexibility p {
                max-width: 600px;
                margin: 0 auto;
                color: rgba(255,255,255,0.75);
                font-size: 18px;
                position: relative;
            }

            /* ====== COMPARISON ====== */
            .compare {
                background: var(--warm-white);
                padding: 110px 0;
            }

            .compare-head {
                text-align: center;
                margin-bottom: 60px;
            }

            .compare-head h2 {
                max-width: 800px;
                margin: 0 auto;
            }

            .compare-table {
                max-width: 920px;
                margin: 0 auto;
                background: white;
                border: 1px solid var(--line);
                border-radius: 10px;
                overflow: hidden;
            }

            .compare-row {
                display: grid;
                grid-template-columns: 1.6fr 1fr 1fr;
                align-items: center;
                border-bottom: 1px solid var(--line);
            }

            .compare-row:last-child {
                border-bottom: none;
            }

            .compare-row.header {
                background: var(--charcoal);
                color: white;
            }

            .compare-cell {
                padding: 22px 24px;
                font-size: 15px;
            }

            .compare-row.header .compare-cell {
                font-family: var(--font-display);
                font-size: 18px;
                font-weight: 600;
            }

            .compare-row.header .compare-cell.plan-pro {
                background: var(--orange);
                color: white;
                position: relative;
            }

            .compare-row.header .compare-cell.plan-pro::after {
                content: 'RECOMENDADO';
                position: absolute;
                top: 8px;
                right: 12px;
                font-family: var(--font-body);
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 0.15em;
                background: white;
                color: var(--orange);
                padding: 3px 8px;
                border-radius: 999px;
            }

            .compare-cell.plan-pro {
                background: rgba(255,87,34,0.04);
                font-weight: 600;
            }

            .compare-cell .yes {
                color: #2d8a4f;
                font-weight: 700;
            }

            .compare-cell .no {
                color: rgba(48,56,65,0.4);
                font-weight: 600;
            }

            .compare-cell .label {
                color: var(--charcoal);
                font-weight: 600;
            }

            /* ====== TESTIMONIALS ====== */
            .testimonials {
                background: var(--cream);
                padding: 120px 0;
            }

            .testimonials-head {
                text-align: center;
                margin-bottom: 70px;
            }

            .testimonials-head h2 {
                max-width: 760px;
                margin: 0 auto 20px;
            }

            .testimonials-head p {
                color: var(--charcoal-soft);
                max-width: 600px;
                margin: 0 auto;
                font-size: 18px;
            }

            .testimonials-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 24px;
                max-width: 1100px;
                margin: 0 auto;
            }

            .testimonial {
                background: white;
                border-radius: 10px;
                padding: 36px 32px;
                position: relative;
            }

            .testimonial-quote {
                font-family: var(--font-display);
                font-size: 60px;
                font-weight: 700;
                color: var(--orange);
                line-height: 1;
                margin-bottom: 10px;
                opacity: 0.5;
            }

            .testimonial-stars {
                color: var(--orange);
                font-size: 16px;
                letter-spacing: 0.1em;
                margin-bottom: 16px;
            }

            .testimonial-text {
                color: var(--charcoal);
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 24px;
                font-style: italic;
            }

            .testimonial-author {
                display: flex;
                align-items: center;
                gap: 14px;
                padding-top: 20px;
                border-top: 1px solid var(--line);
            }

            .testimonial-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--orange), var(--orange-deep));
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: var(--font-display);
                font-weight: 700;
                font-size: 18px;
            }

            .testimonial-author-info strong {
                display: block;
                color: var(--charcoal);
                font-size: 15px;
                font-weight: 700;
            }

            .testimonial-author-info span {
                color: rgba(48,56,65,0.6);
                font-size: 13px;
            }

            /* ====== PRICE / OFFER ====== */
            .offer {
                background: var(--charcoal);
                color: white;
                padding: 120px 0;
                position: relative;
                overflow: hidden;
            }

            .offer::before {
                content: '';
                position: absolute;
                bottom: -150px;
                left: 50%;
                transform: translateX(-50%);
                width: 800px;
                height: 400px;
                background: radial-gradient(ellipse, rgba(255,87,34,0.15) 0%, transparent 70%);
                pointer-events: none;
            }

            .offer-head {
                text-align: center;
                margin-bottom: 50px;
                position: relative;
            }

            .offer-head .eyebrow {
                color: var(--orange);
            }

            .offer-head h2 {
                color: white;
                max-width: 800px;
                margin: 0 auto;
            }

            .offer-head h2 .accent {
                color: var(--orange);
            }

            .offer-card {
                max-width: 720px;
                margin: 0 auto;
                background: var(--charcoal-deep);
                border: 1px solid var(--line-light);
                border-radius: 14px;
                padding: 50px 50px 44px;
                position: relative;
                box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5);
            }

            .offer-card::before {
                content: 'DESCUENTO EXCLUSIVO';
                position: absolute;
                top: -16px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--orange);
                color: white;
                padding: 8px 24px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.2em;
            }

            .offer-name {
                text-align: center;
                font-family: var(--font-display);
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 36px;
                color: white;
            }

            .offer-stack {
                margin-bottom: 36px;
                padding-bottom: 30px;
                border-bottom: 1px dashed var(--line-light);
            }

            .stack-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 11px 0;
                color: rgba(255,255,255,0.85);
                font-size: 15px;
                border-bottom: 1px dashed rgba(255,255,255,0.08);
            }

            .stack-row:last-child {
                border-bottom: none;
            }

            .stack-row span:last-child {
                font-weight: 700;
                color: white;
                font-family: var(--font-display);
            }

            .stack-total {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 18px 0 0;
                color: white;
                font-weight: 700;
                font-size: 18px;
            }

            .stack-total span:last-child {
                font-family: var(--font-display);
                color: var(--orange);
                font-size: 26px;
            }

            .offer-pricing {
                text-align: center;
            }

            .offer-pricing .real-price {
                color: rgba(255,255,255,0.85);
                font-size: 16px;
                margin-bottom: 6px;
                font-weight: 500;
            }

            .offer-pricing .real-price s {
                text-decoration: line-through;
                text-decoration-color: var(--orange);
                text-decoration-thickness: 3px;
                color: rgba(255,255,255,0.7);
            }

            .offer-pricing .your-price-label {
                display: inline-block;
                color: var(--orange);
                font-size: 12px;
                font-weight: 800;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                margin-bottom: 8px;
                margin-top: 18px;
            }

            .offer-pricing .price-big {
                font-family: var(--font-display);
                font-size: clamp(64px, 9vw, 96px);
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 8px;
            }

            .offer-pricing .price-big sup {
                font-size: 0.4em;
                vertical-align: top;
                color: var(--orange);
                margin-right: 4px;
            }

            .offer-pricing .savings {
                color: var(--orange);
                font-weight: 700;
                font-size: 15px;
                margin-bottom: 30px;
            }

            .offer-card .btn-primary {
                width: 100%;
                justify-content: center;
                padding: 24px;
                font-size: 18px;
            }

            .offer-guarantees {
                margin-top: 28px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px;
            }

            .guarantee-pill {
                text-align: center;
                font-size: 12px;
                color: rgba(255,255,255,0.7);
                line-height: 1.4;
            }

            .guarantee-pill strong {
                display: block;
                color: white;
                font-weight: 700;
                margin-bottom: 4px;
                font-size: 13px;
            }

            .guarantee-pill svg {
                width: 22px;
                height: 22px;
                stroke: var(--orange);
                fill: none;
                stroke-width: 1.8;
                margin-bottom: 6px;
            }

            /* ====== FAQ ====== */
            .faq {
                background: var(--warm-white);
                padding: 110px 0;
            }

            .faq-head {
                text-align: center;
                margin-bottom: 60px;
            }

            .faq-head h2 {
                max-width: 700px;
                margin: 0 auto;
            }

            .faq-list {
                max-width: 800px;
                margin: 0 auto;
            }

            .faq-item {
                background: white;
                border: 1px solid var(--line);
                border-radius: 8px;
                margin-bottom: 12px;
                overflow: hidden;
            }

            .faq-q {
                width: 100%;
                background: none;
                border: none;
                padding: 24px 28px;
                text-align: left;
                font-family: var(--font-display);
                font-weight: 600;
                font-size: 18px;
                color: var(--charcoal);
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                transition: color 0.2s;
            }

            .faq-q:hover {
                color: var(--orange);
            }

            .faq-q .plus {
                flex-shrink: 0;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: var(--cream);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--orange);
                font-weight: 700;
                font-size: 18px;
            }

            .faq-item.open .plus {
                background: var(--orange);
                color: white;
                transform: rotate(45deg);
            }

            .faq-a {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.4s ease;
            }

            .faq-a-inner {
                padding: 0 28px 24px;
                color: var(--charcoal-soft);
                font-size: 16px;
                line-height: 1.65;
            }

            .faq-item.open .faq-a {
                max-height: 400px;
            }

            /* ====== FINAL CTA ====== */
            .final-cta {
                background: linear-gradient(160deg, var(--orange) 0%, var(--orange-deep) 100%);
                color: white;
                padding: 120px 0;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .final-cta::before {
                content: '90';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: var(--font-display);
                font-size: 600px;
                font-weight: 700;
                color: rgba(255,255,255,0.06);
                line-height: 1;
                pointer-events: none;
            }

            .final-cta h2 {
                color: white;
                max-width: 880px;
                margin: 0 auto 24px;
                position: relative;
            }

            .final-cta p {
                max-width: 620px;
                margin: 0 auto 50px;
                font-size: 19px;
                color: rgba(255,255,255,0.9);
                position: relative;
            }

            .final-cta .btn-primary {
                background: var(--charcoal);
                color: white;
                box-shadow: 0 20px 50px -10px rgba(0,0,0,0.4);
                position: relative;
            }

            .final-cta .btn-primary:hover {
                background: var(--charcoal-deep);
            }

            .final-cta .signature {
                margin-top: 60px;
                font-family: var(--font-script);
                font-size: 42px;
                color: white;
                line-height: 1;
                position: relative;
            }

            .final-cta .signature-sub {
                margin-top: 6px;
                font-size: 12px;
                letter-spacing: 0.3em;
                color: rgba(255,255,255,0.8);
                font-weight: 700;
                position: relative;
            }

            /* ====== FOOTER ====== */
            footer {
                background: var(--charcoal-deep);
                color: rgba(255,255,255,0.5);
                padding: 50px 0 40px;
                text-align: center;
                font-size: 13px;
            }

            footer p {
                margin-bottom: 8px;
            }

            footer .logo {
                color: white;
                margin-bottom: 14px;
            }

            /* ====== STICKY MOBILE CTA ====== */
            .sticky-cta {
                display: block;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--charcoal);
                padding: 14px 24px;
                padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
                z-index: 99;
                border-top: 1px solid var(--line-light);
                box-shadow: 0 -10px 30px rgba(0,0,0,0.3);
            }

            .sticky-cta-inner {
                max-width: 1100px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 28px;
            }

            .sticky-cta-text {
                color: rgba(255,255,255,0.85);
                font-size: 14px;
                font-weight: 600;
                flex: 1;
                letter-spacing: 0.01em;
            }

            .sticky-cta-text strong {
                color: white;
                font-weight: 800;
            }

            .sticky-cta-text .deadline {
                color: var(--orange);
                font-weight: 700;
            }

            .sticky-cta .btn-primary {
                padding: 14px 30px;
                font-size: 15px;
                white-space: nowrap;
                flex-shrink: 0;
            }

            /* Scroll-margin so #comprar lands in a visually centered spot, not stuck under sticky bar */
            #comprar {
                scroll-margin-top: 20px;
                scroll-margin-bottom: 120px;
            }

            /* ====== PALTI PLUS FEATURE SECTION ====== */
            .palti-feature {
                background: linear-gradient(160deg, var(--warm-white) 0%, var(--cream) 60%, #ede4d8 100%);
                padding: 130px 0;
                position: relative;
                overflow: hidden;
            }

            .palti-feature::before {
                content: 'AI';
                position: absolute;
                top: 40px;
                right: -30px;
                font-family: var(--font-display);
                font-size: 280px;
                font-weight: 700;
                color: rgba(255,87,34,0.04);
                line-height: 1;
                letter-spacing: -0.05em;
                pointer-events: none;
            }

            .palti-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 80px;
                align-items: center;
                position: relative;
            }

            .palti-image {
                position: relative;
                text-align: center;
            }

            .palti-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 110%;
                height: 80%;
                transform: translate(-50%, -45%);
                background: radial-gradient(ellipse, rgba(255,87,34,0.18) 0%, rgba(255,87,34,0) 60%);
                pointer-events: none;
                z-index: 0;
            }

            .palti-image img {
                width: 100%;
                max-width: 460px;
                margin: 0 auto;
                display: block;
                position: relative;
                z-index: 1;
                border-radius: 20px;
                filter: drop-shadow(0 24px 50px rgba(48,56,65,0.18));
            }

            .palti-bubble {
                position: absolute;
                top: 14%;
                right: 4%;
                background: white;
                padding: 14px 18px;
                border-radius: 18px 18px 4px 18px;
                box-shadow: 0 14px 40px -10px rgba(48,56,65,0.18);
                z-index: 3;
                max-width: 220px;
                border: 1px solid rgba(48,56,65,0.06);
                animation: bubbleFloat 4s ease-in-out infinite;
            }

            @keyframes bubbleFloat {
                0%, 100% {
                    transform: translateY(0);
                }

                50% {
                    transform: translateY(-6px);
                }
            }

            .palti-bubble strong {
                display: block;
                color: var(--orange);
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                margin-bottom: 4px;
            }

            .palti-bubble p {
                color: var(--charcoal);
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4;
                margin: 0;
            }

            .palti-bubble .bubble-tail {
                position: absolute;
                bottom: -10px;
                right: 22px;
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 4px solid transparent;
                border-top: 12px solid white;
            }

            .palti-content h2 {
                font-size: clamp(32px, 4.2vw, 52px);
                margin-bottom: 22px;
                color: var(--charcoal);
            }

            .palti-content h2 em {
                color: var(--orange);
                font-style: italic;
            }

            .palti-lead {
                color: var(--charcoal-soft);
                font-size: 19px;
                margin-bottom: 30px;
                line-height: 1.55;
            }

            .palti-features {
                list-style: none;
                padding: 0;
                margin-bottom: 36px;
            }

            .palti-features li {
                display: flex;
                align-items: flex-start;
                gap: 14px;
                padding: 10px 0;
                color: var(--charcoal-soft);
                font-size: 16px;
                line-height: 1.5;
            }

            .palti-features li strong {
                color: var(--charcoal);
                font-weight: 700;
            }

            .palti-features .check {
                flex-shrink: 0;
                width: 26px;
                height: 26px;
                background: var(--orange);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 13px;
                margin-top: 1px;
            }

            .palti-quote {
                position: relative;
                background: white;
                padding: 24px 26px 24px 56px;
                border-radius: 10px;
                border-left: 4px solid var(--orange);
                color: var(--charcoal);
                font-family: var(--font-display);
                font-style: italic;
                font-size: 18px;
                line-height: 1.45;
                box-shadow: 0 12px 30px -8px rgba(48,56,65,0.08);
            }

            .palti-quote-mark {
                position: absolute;
                left: 18px;
                top: 8px;
                font-family: var(--font-display);
                font-size: 60px;
                font-weight: 700;
                color: var(--orange);
                line-height: 1;
            }

            /* ====== RESPONSIVE ====== */
            @media (max-width: 900px) {
                .authority-grid {
                    grid-template-columns: 1fr;
                    gap: 50px;
                }

                .authority::before {
                    font-size: 250px;
                }

                .palti-grid {
                    grid-template-columns: 1fr;
                    gap: 50px;
                }

                .palti-image {
                    order: -1;
                    max-width: 420px;
                    margin: 0 auto;
                }

                .palti-feature {
                    padding: 90px 0;
                }

                .palti-feature::before {
                    font-size: 180px;
                    top: 20px;
                    right: -10px;
                }

                .palti-bubble {
                    max-width: 180px;
                    top: 12%;
                }

                .compare-row {
                    grid-template-columns: 1.4fr 1fr 1fr;
                }

                .compare-cell {
                    padding: 16px 14px;
                    font-size: 13px;
                }

                .offer-card {
                    padding: 40px 24px 36px;
                }

                .offer-guarantees {
                    grid-template-columns: 1fr;
                }

                .hero {
                    padding: 50px 0 70px;
                }

                .sticky-cta {
                    padding: 12px 16px;
                    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
                }

                .sticky-cta-text {
                    display: none;
                }

                .sticky-cta .btn-primary {
                    width: 100%;
                    justify-content: center;
                    padding: 16px 20px;
                }

                body {
                    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
                }
            }

            @media (max-width: 600px) {
                .stack-row {
                    font-size: 13px;
                }

                .nav-cta {
                    display: none;
                }

                .urgency-bar {
                    font-size: 12px;
                    padding: 10px 16px;
                }

                .urgency-bar .dot {
                    margin: 0 8px;
                }

                .pain {
                    padding: 80px 0;
                }

                .authority, .includes, .compare, .testimonials, .offer, .faq, .final-cta {
                    padding: 80px 0;
                }
            }

            /* Scroll reveal */
            .reveal {
                opacity: 0;
                transform: translateY(24px);
                transition: opacity 0.7s ease, transform 0.7s ease;
            }

            .reveal.in {
                opacity: 1;
                transform: translateY(0);
            }
        </style>
    </head>
    <body>
        <!-- URGENCY BAR -->
        <div class="urgency-bar">
            <strong>SOLO 20 CUPOS DISPONIBLES</strong>
            <span class="dot"></span>
            DESCUENTO HASTA EL VIERNES 22 DE MAYO <span class="dot"></span>
            AHORRA $450 USD

        </div>
        <!-- NAV -->
        <nav>
            <div class="container">
                <div class="logo">
                    Germán Roz <span>CHEF NUTRICIONISTA</span>
                </div>
                <a href="#comprar" class="nav-cta">Quiero el Plan 90 Pro →</a>
            </div>
        </nav>
        <!-- HERO + VSL -->
        <section class="hero">
            <div class="container">
                <div class="hero-pre">PLAN 90 PRO · PARA MUJERES +35</div>
                <h2 class="hero-hook">
                    La solución <em>definitiva</em>
                    .
                </h2>
                <!-- VSL -->
                <div class="vsl-wrapper">
                    <div class="vsl-frame" id="vslFrame" aria-label="Video con Germán Roz · Plan 90 Pro">
                        <button type="button" class="vsl-play" id="vslUnmute" aria-label="Activar audio del video">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                            <span>Activar sonido</span>
                        </button>
                    </div>
                </div>
                <h1>
                    Tu transformación <em class="accent">definitiva</em>
                    de 90 días <span class="underline-orange">empieza hoy</span>
                    .
                </h1>
                <p class="hero-sub">Diagnóstico 1:1 con Germán y un equipo de profesionales trabajando contigo todos los días.</p>
                <div class="hero-cta-block">
                    <a href="#comprar" class="btn-primary">
                        Quiero Mi Lugar en el Plan 90 Pro
        <span class="arrow">→</span>
                    </a>
                    <div class="hero-cta-meta">
                        <span>★★★★★</span>
                        Más de 3,200 mujeres ya lo lograron con Germán
      
                    </div>
                </div>
            </div>
        </section>
        <!-- TRUST STRIP -->
        <div class="trust-strip">
            <div class="container">
                <div class="trust-item">
                    <strong>+10</strong>
                    años de experiencia
                </div>
                <div class="trust-item">
                    <strong>+3,200</strong>
                    mujeres transformadas
                </div>
                <div class="trust-item">
                    <strong>+250K</strong>
                    seguidores en redes
                </div>
            </div>
        </div>
        <!-- PAIN SECTION -->
        <section class="pain">
            <div class="container">
                <div class="reveal">
                    <span class="eyebrow">SI TE IDENTIFICAS CON ESTO...</span>
                    <h2>
                        Probaste dietas. Probaste pastillas. Probaste el gimnasio. <em class="accent">Y nada se sostiene.</em>
                    </h2>
                    <p class="pain-intro">No es tu culpa. El problema nunca fue tu fuerza de voluntad — fue que nadie te dio un sistema real.</p>
                </div>
                <div class="pain-list">
                    <div class="pain-item reveal">
                        <span class="pain-x">✕</span>
                        <span>Te despiertas hinchada, cansada y con poca energía aunque "comas bien"</span>
                    </div>
                    <div class="pain-item reveal">
                        <span class="pain-x">✕</span>
                        <span>Empiezas una dieta el lunes y para el viernes ya la abandonaste</span>
                    </div>
                    <div class="pain-item reveal">
                        <span class="pain-x">✕</span>
                        <span>Te aburre comer pollo con brócoli como si la comida saludable fuera un castigo</span>
                    </div>
                    <div class="pain-item reveal">
                        <span class="pain-x">✕</span>
                        <span>No sabes qué comer en cada momento del día y terminas improvisando</span>
                    </div>
                    <div class="pain-item reveal">
                        <span class="pain-x">✕</span>
                        <span>Cuando tienes dudas o ansiedad, no tienes a quién preguntar al instante</span>
                    </div>
                    <div class="pain-item reveal">
                        <span class="pain-x">✕</span>
                        <span>Los planes "genéricos" no funcionan para tu cuerpo, tu vida ni tu ritmo</span>
                    </div>
                </div>
                <p class="pain-close reveal">
                    "Lo que te falta no es una dieta más. <strong>Lo que te falta es un equipo completo trabajando contigo todos los días.</strong>
                    "
    
                </p>
            </div>
        </section>
        <!-- AUTHORITY -->
        <section class="authority">
            <div class="container">
                <div class="authority-grid">
                    <div class="authority-img reveal"></div>
                    <div class="reveal">
                        <span class="eyebrow">CONOCE A TU CHEF + NUTRICIONISTA</span>
                        <h2>
                            Soy Germán Roz. Y llevo más de <em>10 años</em>
                            demostrando que comer rico y comer bien no son cosas opuestas.
                        </h2>
                        <p>
                            Me formé en Le Cordon Bleu y cociné en Lima, Estados Unidos y California. Después estudié nutrición y entendí algo: <strong style="color:white">la mayoría de mujeres no tienen un problema de comida — tienen un problema de sistema.</strong>
                        </p>
                        <p>Por eso creé el Plan 90 Pro. No es otra dieta. Es el único programa donde tienes acceso directo a mí, a tu propia nutricionista y a una IA que te acompaña 24/7.</p>
                        <div class="authority-creds">
                            <div class="cred-item">
                                <strong>Le Cordon Bleu</strong>
                                <span>FORMACIÓN PROFESIONAL</span>
                            </div>
                            <div class="cred-item">
                                <strong>Huella Verde</strong>
                                <span>FUNDADOR Y CHEF</span>
                            </div>
                            <div class="cred-item">
                                <strong>La Caleta</strong>
                                <span>RESTAURANTE PROPIO</span>
                            </div>
                            <div class="cred-item">
                                <strong>3,200+</strong>
                                <span>MUJERES TRANSFORMADAS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- SOLUTION REVEAL -->
        <section class="solution">
            <div class="container">
                <div class="reveal">
                    <div class="solution-badge">La Solución Definitiva</div>
                    <h2>
                        Te presento el <span class="accent">Plan 90 Pro</span>
                        — el único programa premium donde no estás sola ni un solo día.
                    </h2>
                    <p class="solution-sub">
                        90 días no son una dieta. Son el tiempo exacto para resetear hormonas, recuperar metabolismo e instalar hábitos que <strong>se quedan contigo para siempre</strong>
                        .
      
                    </p>
                </div>
            </div>
        </section>
        <!-- INCLUYE / VALUE STACK -->
        <section class="includes">
            <div class="container">
                <div class="includes-head reveal">
                    <span class="eyebrow">QUÉ INCLUYE EL PLAN 90 PRO</span>
                    <h2>Todo lo que necesitas para transformarte. Cero excusas.</h2>
                    <p>Cada elemento resuelve un punto donde las dietas tradicionales fallan.</p>
                </div>
                <div class="includes-grid">
                    <div class="include-card highlight reveal">
                        <div class="include-num">01</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <rect x="9" y="3" width="6" height="4" rx="1"/>
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                                <path d="M9 11h6M9 14h6M9 17h4"/>
                            </svg>
                        </div>
                        <h3>Sesión de Diagnóstico 1:1 con Germán</h3>
                        <p>Tu primera sesión es directamente con Germán Roz. Diagnóstico completo, lectura de tu cuerpo, definición de objetivos reales y plan de ataque personalizado. Tú frente a frente con él — sin intermediarios.</p>
                        <span class="include-value">
                            Valor real: <strong>$300 USD</strong>
                        </span>
                    </div>
                    <div class="include-card reveal">
                        <div class="include-num">02</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                            </svg>
                        </div>
                        <h3>5 Sesiones con Profesionales Certificados por Germán</h3>
                        <p>Profesionales clínicos certificados directamente por Germán y su metodología. Te acompañan durante el programa para ajustar el plan según tus resultados, hormonas, ciclo y vida real. Sesiones privadas, agendadas a tu ritmo.</p>
                        <span class="include-value">
                            Valor real: <strong>$400 USD</strong>
                        </span>
                    </div>
                    <div class="include-card reveal">
                        <div class="include-num">03</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <h3>3 Masterclasses Grupales con Germán</h3>
                        <p>Una sesión grupal al mes con Germán durante los 3 meses del programa. Casos reales, preguntas y respuestas, contenido avanzado y la energía de un grupo de mujeres avanzando juntas. Acceso a las grabaciones por si no puedes en vivo.</p>
                        <span class="include-value">
                            Valor real: <strong>$180 USD</strong>
                        </span>
                    </div>
                    <div class="include-card reveal">
                        <div class="include-num">04</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M3 11l18-5v12L3 14v-3z"/>
                                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                            </svg>
                        </div>
                        <h3>Menús Personalizados a Tu Medida</h3>
                        <p>No es un PDF genérico. Tus menús se construyen en base a tus gustos, tus horarios, tus restricciones, tu ciclo hormonal y tu objetivo. Se actualizan cada mes con tu nutricionista.</p>
                        <span class="include-value">
                            Valor real: <strong>$250 USD</strong>
                        </span>
                    </div>
                    <div class="include-card reveal">
                        <div class="include-num">05</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                        </div>
                        <h3>Palti Plus AI — Acompañamiento 24/7 por WhatsApp</h3>
                        <p>La IA entrenada con todo el conocimiento de Germán. Pregúntale a las 11 PM si puedes comer eso. Cuándo tienes ansiedad. Cuando viajas. Responde al instante, en WhatsApp, todos los días del año.</p>
                        <span class="include-value">
                            Valor real: <strong>$300 USD</strong>
                        </span>
                    </div>
                    <div class="include-card reveal">
                        <div class="include-num">06</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <h3>Comunidad Premium de Germán</h3>
                        <p>Acceso exclusivo a la comunidad cerrada de mujeres que están en el mismo camino que tú. Soporte diario, contenido anticipado, lives extra, recetas nuevas y la energía de un grupo que avanza contigo durante y después del programa.</p>
                        <span class="include-value">
                            Valor real: <strong>$200 USD</strong>
                        </span>
                    </div>
                    <div class="include-card reveal">
                        <div class="include-num">07</div>
                        <div class="include-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                        </div>
                        <h3>Recetario Premium</h3>
                        <p>Más de 120 recetas exclusivas creadas por Germán como Chef Nutricionista. Desayunos, almuerzos, snacks, postres y opciones para cuando comes fuera. Todas con macros, fotos profesionales y videos paso a paso.</p>
                        <span class="include-value">
                            Valor real: <strong>$110 USD</strong>
                        </span>
                    </div>
                </div>
            </div>
        </section>
        <!-- FLEXIBILITY -->
        <section class="flexibility">
            <div class="container">
                <div class="reveal">
                    <span class="eyebrow">A TU RITMO. EN TU AGENDA.</span>
                    <h2>
                        Tus sesiones 1:1 las agendas <em>tú</em>
                        , según tu disponibilidad.
                    </h2>
                    <p>La sesión de diagnóstico con Germán y las 5 sesiones con tus profesionales certificados las eliges en los horarios que mejor te funcionen. Las 3 masterclasses grupales mensuales se anuncian con anticipación y quedan grabadas. Tu vida no se pausa: tu transformación se adapta a ella.</p>
                </div>
            </div>
        </section>
        <!-- PALTI PLUS HIGHLIGHT SECTION -->
        <section class="palti-feature">
            <div class="container">
                <div class="palti-grid">
                    <div class="palti-image reveal">
                        <div class="palti-glow"></div>
                        <img src="data:image/jpeg;base64,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" alt="Palti Plus AI" loading="lazy">
                        <div class="palti-bubble">
                            <span class="bubble-tail"></span>
                            <strong>Palti</strong>
                            <p>"Hola! ¿Te puedo ayudar con algo de tu plan?"</p>
                        </div>
                    </div>
                    <div class="palti-content reveal">
                        <span class="eyebrow">ACOMPAÑAMIENTO INTELIGENTE 24/7</span>
                        <h2>
                            Conoce a <em>Palti Plus</em>
                            — tu nutricionista de bolsillo.
                        </h2>
                        <p class="palti-lead">La IA entrenada con toda la metodología de Germán. Vive en tu WhatsApp, responde al instante y nunca duerme.</p>
                        <ul class="palti-features">
                            <li>
                                <span class="check">✓</span>
                                <strong>Responde 24/7 en tu WhatsApp</strong>
                                — sin esperar al día siguiente
                            </li>
                            <li>
                                <span class="check">✓</span>
                                <strong>Entrenado con la metodología de Germán</strong>
                                — no es un ChatGPT genérico
                            </li>
                            <li>
                                <span class="check">✓</span>
                                <strong>Cero fricción</strong>
                                — sin agendas, sin formularios, solo escribir o enviar un audio
                            </li>
                            <li>
                                <span class="check">✓</span>
                                <strong>Te salva en momentos clave</strong>
                                — ansiedad nocturna, restaurantes, viajes, snacks
                            </li>
                        </ul>
                        <div class="palti-quote">
                            <span class="palti-quote-mark">"</span>
                            Es como tener a Germán y a tu nutricionista en el bolsillo, todos los días del año.
        
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- COMPARISON -->
        <section class="compare">
            <div class="container">
                <div class="compare-head reveal">
                    <span class="eyebrow">POR QUÉ ES DIFERENTE</span>
                    <h2>
                        Lo que tienes hoy <span class="accent">vs.</span>
                        lo que tendrás con el Plan 90 Pro
                    </h2>
                </div>
                <div class="compare-table reveal">
                    <div class="compare-row header">
                        <div class="compare-cell"></div>
                        <div class="compare-cell">Dieta o app genérica</div>
                        <div class="compare-cell plan-pro">Plan 90 Pro</div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Sesión de diagnóstico con Germán</div>
                        <div class="compare-cell">
                            <span class="no">✕ No</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ Incluida</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Profesionales certificados por Germán</div>
                        <div class="compare-cell">
                            <span class="no">✕ No</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ 5 sesiones 1:1</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Masterclasses grupales con Germán</div>
                        <div class="compare-cell">
                            <span class="no">✕ No</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ 3 mensuales</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Menús adaptados a TU cuerpo</div>
                        <div class="compare-cell">
                            <span class="no">✕ Genéricos</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ 100% personalizados</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Soporte en tiempo real</div>
                        <div class="compare-cell">
                            <span class="no">✕ Sin respuesta</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ IA 24/7 en WhatsApp</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Comunidad activa de apoyo</div>
                        <div class="compare-cell">
                            <span class="no">✕ Estás sola</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ Comunidad premium</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Duración para crear hábitos reales</div>
                        <div class="compare-cell">
                            <span class="no">7 a 21 días</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ 90 días completos</span>
                        </div>
                    </div>
                    <div class="compare-row">
                        <div class="compare-cell label">Resultados sostenibles</div>
                        <div class="compare-cell">
                            <span class="no">✕ Rebote</span>
                        </div>
                        <div class="compare-cell plan-pro">
                            <span class="yes">✓ Para siempre</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- TESTIMONIALS -->
        <section class="testimonials">
            <div class="container">
                <div class="testimonials-head reveal">
                    <span class="eyebrow">HISTORIAS REALES</span>
                    <h2>Mujeres que decidieron y nunca volvieron atrás.</h2>
                    <p>Cada testimonio es de una mujer que estaba donde estás tú hoy. La diferencia: dieron el paso.</p>
                </div>
                <div class="testimonials-grid">
                    <div class="testimonial reveal">
                        <div class="testimonial-quote">"</div>
                        <div class="testimonial-stars">★★★★★</div>
                        <p class="testimonial-text">En 90 días bajé 7 kilos, pero lo más importante: dejé de obsesionarme con la comida. Tener a Germán y a mi nutricionista respondiéndome en cada duda cambió todo. El Palti Plus me salvó muchísimas noches de ansiedad.</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">M</div>
                            <div class="testimonial-author-info">
                                <strong>María Fernanda C.</strong>
                                <span>42 años · Lima, Perú</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial reveal">
                        <div class="testimonial-quote">"</div>
                        <div class="testimonial-stars">★★★★★</div>
                        <p class="testimonial-text">Probé de todo antes: nutricionistas, apps, gimnasios. Nada funcionaba porque me sentía sola. Con el Plan 90 Pro tuve un equipo entero. Mis menús eran deliciosos y específicos para mi cuerpo. Bajé 2 tallas y mi energía volvió.</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">A</div>
                            <div class="testimonial-author-info">
                                <strong>Andrea P.</strong>
                                <span>38 años · Bogotá, Colombia</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial reveal">
                        <div class="testimonial-quote">"</div>
                        <div class="testimonial-stars">★★★★★</div>
                        <p class="testimonial-text">Lo que más me gustó es que podía agendar las sesiones cuando yo quisiera. Soy mamá de 3 y empresaria — no podía con horarios rígidos. El programa se adaptó a mi vida y por eso pude sostenerlo. Hoy llevo 6 meses manteniendo mis resultados.</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">V</div>
                            <div class="testimonial-author-info">
                                <strong>Valentina M.</strong>
                                <span>45 años · Santiago, Chile</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- OFFER / PRICING -->
        <section class="offer" id="oferta">
            <div class="container">
                <div class="offer-head reveal">
                    <span class="eyebrow">TU INVERSIÓN</span>
                    <h2>
                        El precio real es <span class="strike">$1,100 USD</span>
                        — Hoy, por participar en el reto, es <span class="accent">$650 USD</span>
                        .
                    </h2>
                </div>
                <div class="offer-card reveal">
                    <div style="text-align:center; margin-bottom:18px;">
                        <span style="display:inline-block; background:rgba(255,87,34,0.15); color:var(--orange); padding:7px 18px; border-radius:999px; font-size:11px; font-weight:800; letter-spacing:0.18em; text-transform:uppercase; border:1px solid rgba(255,87,34,0.3);">★ Solo 20 cupos disponibles
        </span>
                    </div>
                    <div class="offer-name">Plan 90 Pro</div>
                    <div class="offer-stack">
                        <div class="stack-row">
                            <span>Sesión de Diagnóstico 1:1 con Germán</span>
                            <span>$300</span>
                        </div>
                        <div class="stack-row">
                            <span>5 Sesiones con Profesionales Certificados</span>
                            <span>$400</span>
                        </div>
                        <div class="stack-row">
                            <span>3 Masterclasses Grupales con Germán</span>
                            <span>$180</span>
                        </div>
                        <div class="stack-row">
                            <span>Menús Personalizados a tu medida</span>
                            <span>$250</span>
                        </div>
                        <div class="stack-row">
                            <span>Palti Plus AI · WhatsApp 24/7</span>
                            <span>$300</span>
                        </div>
                        <div class="stack-row">
                            <span>Comunidad Premium de Germán</span>
                            <span>$200</span>
                        </div>
                        <div class="stack-row">
                            <span>Recetario Premium (+120 recetas)</span>
                            <span>$110</span>
                        </div>
                        <div class="stack-total">
                            <span>Valor real del programa</span>
                            <span>$1,740 USD</span>
                        </div>
                    </div>
                    <div class="offer-pricing" id="comprar">
                        <div class="real-price">
                            Precio normal: <s>$1,100 USD</s>
                        </div>
                        <div class="your-price-label">SOLO HASTA EL VIERNES 22 DE MAYO</div>
                        <div class="price-big">
                            <sup>$</sup>
                            650<span style="font-size:0.35em; color:rgba(255,255,255,0.5)">USD</span>
                        </div>
                        <div class="savings">→ Ahorras $450 USD frente al precio normal</div>
                        <a href="https://whop.com/checkout/1U9SFTVfwaUqxtbLa1-cIsC-aWVj-Ok3M-sHjDntR15Rcl/" target="_top" rel="noopener" class="btn-primary">
                            QUIERO MI LUGAR EN EL PLAN 90 PRO
          <span class="arrow">→</span>
                        </a>
                    </div>
                    <div class="offer-guarantees">
                        <div class="guarantee-pill">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <strong>Garantía 14 días</strong>
                            Si no es para ti, devolvemos tu dinero.
        
                        </div>
                        <div class="guarantee-pill">
                            <svg viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <strong>Pago seguro</strong>
                            Encriptado y protegido.
        
                        </div>
                        <div class="guarantee-pill">
                            <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                            <strong>Empiezas ahora</strong>
                            Acceso inmediato al sistema.
        
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- FAQ -->
        <section class="faq">
            <div class="container">
                <div class="faq-head reveal">
                    <span class="eyebrow">PREGUNTAS FRECUENTES</span>
                    <h2>Resolvamos lo que te falta para decidir.</h2>
                </div>
                <div class="faq-list">
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿Cuándo empiezo y cómo se agendan las sesiones?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Empiezas el mismo día de tu inscripción. Recibes acceso inmediato al sistema, al recetario y a la comunidad. Tu primera sesión es un diagnóstico 1:1 con Germán. Después tienes 5 sesiones 1:1 con tus profesionales certificados, agendadas a tu ritmo. A lo largo de los 3 meses también tienes una masterclass grupal mensual con Germán (con grabación disponible si no puedes en vivo).</div>
                        </div>
                    </div>
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿Es para mí si nunca he seguido un plan nutricional antes?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Sí. De hecho, está diseñado especialmente para mujeres que sienten que "ya probaron de todo" y nada les funcionó. El plan se adapta a tu punto de partida real. No tienes que llegar preparada — solo decidida.</div>
                        </div>
                    </div>
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿Qué pasa si no me gusta? ¿Hay garantía?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Tienes 14 días de garantía total. Si por cualquier razón sientes que el programa no es para ti, te devolvemos el 100% de tu dinero sin preguntas. Asumimos todo el riesgo nosotros.</div>
                        </div>
                    </div>
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿El Palti Plus es realmente útil? ¿Funciona en WhatsApp?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Sí. Palti Plus es la IA entrenada por Germán con todo su conocimiento clínico y culinario. Vive en tu WhatsApp, responde al instante 24/7 y te ayuda en los momentos críticos: cuándo tienes ansiedad, cuando viajas, cuando comes fuera, cuando no sabes qué cocinar a última hora.</div>
                        </div>
                    </div>
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿Los menús son aburridos o restrictivos?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Todo lo contrario. Germán es Chef antes que Nutricionista — su filosofía es que la comida saludable tiene que ser deliciosa o no es sostenible. Tus menús incluyen postres, snacks, opciones para comer fuera y recetas que toda tu familia puede disfrutar.</div>
                        </div>
                    </div>
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿Puedo pagar en cuotas?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Sí. En el checkout encontrarás opciones para pagar en una sola cuota o dividirlo en cuotas mensuales con la mayoría de tarjetas. Escríbenos si necesitas un plan de pago especial.</div>
                        </div>
                    </div>
                    <div class="faq-item reveal">
                        <button class="faq-q">
                            ¿Por qué 90 días y no menos?
          <span class="plus">+</span>
                        </button>
                        <div class="faq-a">
                            <div class="faq-a-inner">Porque tu cuerpo necesita ese tiempo para resetear hormonas, estabilizar metabolismo e instalar hábitos que se sostengan. Programas más cortos producen resultados temporales. 90 días produce transformación real y duradera.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- FINAL CTA -->
        <section class="final-cta">
            <div class="container">
                <div class="reveal">
                    <h2>
                        En 90 días vas a ser otra persona. La pregunta es: <em style="font-style:italic">¿con qué versión vas a llegar?</em>
                    </h2>
                    <p>Vas a cumplir 90 días igual. La diferencia es si llegas con la energía recuperada, el cuerpo que te mereces y una nueva forma de comer para siempre — o exactamente donde estás hoy.</p>
                    <a href="#comprar" class="btn-primary">
                        SÍ, QUIERO EMPEZAR HOY POR $650
        <span class="arrow">→</span>
                    </a>
                    <div class="signature">Germán Roz</div>
                    <div class="signature-sub">CHEF NUTRICIONISTA</div>
                </div>
            </div>
        </section>
        <!-- FOOTER -->
        <footer>
            <div class="container">
                <div class="logo">
                    Germán Roz <span>CHEF NUTRICIONISTA</span>
                </div>
                <p>© 2026 Germán Roz. Todos los derechos reservados.</p>
                <p style="margin-top:14px; font-size:11px; opacity:0.6;">Los resultados pueden variar según el compromiso individual. Este programa no reemplaza el consejo médico profesional.</p>
            </div>
        </footer>
        <!-- FLOATING WHATSAPP BUTTON: rendered by the parent (LandingFrame)
             so it stays fixed to the browser viewport across iframe scroll. -->
        <!-- STICKY CTA (desktop + mobile) -->
        <div class="sticky-cta">
            <div class="sticky-cta-inner">
                <div class="sticky-cta-text">
                    <strong>Plan 90 Pro</strong>
                    · Solo 20 cupos · <span class="deadline">Hasta viernes 22 de mayo</span>
                </div>
                <a href="#comprar" class="btn-primary">Quiero un cambio definitivo →
    </a>
            </div>
        </div>
        <script>
            // FAQ accordion
            document.querySelectorAll('.faq-q').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.parentElement.classList.toggle('open');
                }
                );
            }
            );

            // Scroll reveal
            const io = new IntersectionObserver( (entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        io.unobserve(e.target);
                    }
                }
                );
            }
            ,{
                threshold: 0.12
            });
            document.querySelectorAll('.reveal').forEach(el => io.observe(el));
        </script>

        <!-- ============================================================
             VSL — YouTube embed
             Mirrors apps/web/src/app/(landings)/german-roz/vsl-desinflamate
             pattern: autoplay muted on load, "Activar audio" overlay
             reloads the iframe unmuted on the user gesture, custom
             fullscreen toggle, 1.25x playback rate, and milestone
             tracking via postMessage to the parent.
             ============================================================ -->
        <script>
            (function () {
                var YT_ID = 'cLuB4LamEZ8';
                var SPEED = 1.25;
                var BASE_PARAMS = 'playsinline=1&rel=0&modestbranding=1&controls=0&fs=0&disablekb=1&iv_load_policy=3&enablejsapi=1';

                function buildSrc(muted) {
                    return 'https://www.youtube.com/embed/' + YT_ID +
                        '?autoplay=1&mute=' + (muted ? '1' : '0') + '&' + BASE_PARAMS;
                }

                function boot() {
                    var frame = document.getElementById('vslFrame');
                    var btn = document.getElementById('vslUnmute');
                    if (!frame || !btn) return setTimeout(boot, 200);

                    var iframe = document.createElement('iframe');
                    iframe.id = 'yt-vsl';
                    iframe.title = 'Plan 90 Pro — Germán Roz';
                    iframe.src = buildSrc(true);
                    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
                    iframe.allowFullscreen = true;
                    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;display:block;z-index:1;';
                    frame.insertBefore(iframe, btn);

                    function sendCommand(func, args) {
                        try {
                            iframe.contentWindow.postMessage(
                                JSON.stringify({ event: 'command', func: func, args: args || [] }),
                                '*'
                            );
                        } catch (_) {}
                    }

                    function subscribe() {
                        try {
                            iframe.contentWindow.postMessage(
                                JSON.stringify({ event: 'listening' }),
                                '*'
                            );
                        } catch (_) {}
                    }
                    iframe.addEventListener('load', subscribe);
                    setTimeout(subscribe, 600);
                    setTimeout(subscribe, 1500);

                    btn.addEventListener('click', function () {
                        iframe.src = buildSrc(false);
                        btn.classList.add('is-hidden');
                        setTimeout(function () { btn.remove(); }, 400);
                        iframe.addEventListener('load', function () {
                            setTimeout(function () { sendCommand('setPlaybackRate', [SPEED]); }, 1000);
                            setTimeout(function () { sendCommand('setPlaybackRate', [SPEED]); }, 2500);
                            subscribe();
                        });
                    });

                    var fsBtn = document.createElement('button');
                    fsBtn.type = 'button';
                    fsBtn.innerHTML = '\u26F6 Pantalla completa';
                    fsBtn.setAttribute('aria-label', 'Alternar pantalla completa');
                    fsBtn.style.cssText = 'position:absolute;right:12px;bottom:12px;z-index:35;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:.55rem .85rem;font-size:12px;line-height:1;font-weight:700;letter-spacing:.02em;color:#fff;background:rgba(12,12,12,.62);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s ease;font-family:inherit;';
                    frame.appendChild(fsBtn);

                    var fsBtnTimer = null;
                    function setFsVisible(visible) {
                        fsBtn.style.opacity = visible ? '1' : '0';
                        fsBtn.style.pointerEvents = visible ? 'auto' : 'none';
                    }
                    function showFsBriefly() {
                        setFsVisible(true);
                        clearTimeout(fsBtnTimer);
                        fsBtnTimer = setTimeout(function () { setFsVisible(false); }, 1800);
                    }
                    frame.addEventListener('mousemove', showFsBriefly);
                    frame.addEventListener('touchstart', showFsBriefly, { passive: true });
                    frame.addEventListener('click', showFsBriefly);
                    fsBtn.addEventListener('mouseenter', showFsBriefly);
                    fsBtn.addEventListener('focus', showFsBriefly);

                    function setFsLabel() {
                        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                        fsBtn.innerHTML = isFs ? '\u2715 Salir pantalla completa' : '\u26F6 Pantalla completa';
                    }

                    fsBtn.addEventListener('click', function (ev) {
                        ev.stopPropagation();
                        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                        if (isFs) {
                            var exit = document.exitFullscreen || document.webkitExitFullscreen;
                            if (exit) exit.call(document);
                            return;
                        }
                        var req = frame.requestFullscreen || frame.webkitRequestFullscreen;
                        if (req) {
                            var p = req.call(frame);
                            if (p && p.catch) p.catch(function () {});
                        }
                    });

                    document.addEventListener('fullscreenchange', function () { setFsLabel(); showFsBriefly(); });
                    document.addEventListener('webkitfullscreenchange', function () { setFsLabel(); showFsBriefly(); });

                    var milestones = { 25: false, 50: false, 75: false, 100: false };
                    window.addEventListener('message', function (e) {
                        var data;
                        try {
                            data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                        } catch (_) { return; }
                        if (!data || data.event !== 'infoDelivery' || !data.info) return;
                        var ct = data.info.currentTime;
                        var dur = data.info.duration;
                        if (!dur || ct == null) return;
                        var pct = (ct / dur) * 100;
                        [25, 50, 75, 100].forEach(function (m) {
                            if (pct >= m && !milestones[m]) {
                                milestones[m] = true;
                                try {
                                    window.parent.postMessage(
                                        { type: 'vsl-milestone', milestone: m, videoId: YT_ID },
                                        '*'
                                    );
                                } catch (_) {}
                            }
                        });
                    });
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 200); });
                } else {
                    setTimeout(boot, 200);
                }
            })();
        </script>

        <!-- ============================================================
             IFRAME BRIDGE — auto-resize parent + anchor relay
             (mirrors recetas-cami/guia pattern; fixes iOS Instagram WebView)
             ============================================================ -->
        <script>
            (function () {
                function inIframe() {
                    try { return window.parent && window.parent !== window; }
                    catch (_) { return true; }
                }
                function postHeight() {
                    if (!inIframe()) return;
                    try {
                        var h = Math.max(
                            document.documentElement.scrollHeight,
                            document.body ? document.body.scrollHeight : 0
                        );
                        window.parent.postMessage({ type: 'iframe-height', height: h }, '*');
                    } catch (_) {}
                }
                if (document.readyState === 'complete') postHeight();
                else window.addEventListener('load', postHeight);
                window.addEventListener('resize', postHeight);
                if ('ResizeObserver' in window) {
                    try { new ResizeObserver(postHeight).observe(document.documentElement); } catch (_) {}
                }
                setTimeout(postHeight, 100);
                setTimeout(postHeight, 600);
                setTimeout(postHeight, 1500);
                setTimeout(postHeight, 3000);

                document.addEventListener('click', function (e) {
                    var link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
                    if (!link) return;
                    var href = link.getAttribute('href') || '';
                    if (href.length < 2 || href === '#') return;
                    var id = href.slice(1);
                    var target = document.getElementById(id);
                    if (!target) return;
                    e.preventDefault();
                    if (inIframe()) {
                        try {
                            var rect = target.getBoundingClientRect();
                            var top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
                            window.parent.postMessage({ type: 'iframe-scroll-to', top: top, hash: href }, '*');
                            return;
                        } catch (_) {}
                    }
                    try {
                        target.scrollIntoView({ block: 'start', behavior: 'auto' });
                    } catch (_) {
                        var rect2 = target.getBoundingClientRect();
                        window.scrollTo(0, rect2.top + (window.pageYOffset || document.documentElement.scrollTop || 0));
                    }
                    if (window.history && history.replaceState) {
                        try { history.replaceState(null, '', href); } catch (_) {}
                    }
                }, true);
            })();
        </script>
    </body>
</html>`;

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const html = LANDING_HTML.replace(/__API_URL__/g, apiUrl);
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
