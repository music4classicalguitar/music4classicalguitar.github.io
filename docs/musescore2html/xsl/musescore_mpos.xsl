<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
   xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
   version="1.0">
   <xsl:output method="text" encoding="UTF-8"/>

   <xsl:variable name ="nl">
     <xsl:text>
</xsl:text>
   </xsl:variable>

   <xsl:template match="text()|@*"/>

   <xsl:template match="/">
   
      <xsl:value-of select="'{'"/>
      <xsl:value-of select="$nl"/>
      
      <xsl:apply-templates select="/score/events"/>
      <xsl:apply-templates select="/score/elements"/>
      
      <xsl:value-of select="'}'"/>
      <xsl:value-of select="$nl"/>
      
   </xsl:template>

   <xsl:template match="/score/events">
   
      <xsl:value-of select="'&quot;time&quot;: [{'"/>
      <xsl:value-of select="$nl"/>
      
      <xsl:for-each select="event">
         <xsl:value-of select="'        &quot;position&quot;: '"/>
         <xsl:value-of select="@position"/>
         <xsl:value-of select="','"/>
         <xsl:value-of select="$nl"/>
         
         <xsl:value-of select="'        &quot;elid&quot;: '"/>
         <xsl:value-of select="@elid"/>
         <xsl:value-of select="$nl"/>
         <xsl:if test="position()!= last()">
            <xsl:value-of select="'    }, {'"/>
            <xsl:value-of select="$nl"/>
         </xsl:if>
      </xsl:for-each>
      <xsl:value-of select="'    }],'"/>
      <xsl:value-of select="$nl"/>
      
   </xsl:template>

   <xsl:template match="/score/elements">
      <xsl:value-of select="'&quot;space&quot;: [{'"/>
      <xsl:value-of select="$nl"/>
      
      <xsl:for-each select="element">
         <xsl:value-of select="'        &quot;id&quot;: '"/>
         <xsl:value-of select="@id"/>
         <xsl:value-of select="','"/>
         <xsl:value-of select="$nl"/>
         
         <xsl:value-of select="'        &quot;page&quot;: '"/>
         <xsl:value-of select="(@page+1)"/>
         <xsl:value-of select="','"/>
         <xsl:value-of select="$nl"/>
          
         <xsl:value-of select="'        &quot;sy&quot;: '"/>
         <xsl:value-of select="@sy"/>
         <xsl:value-of select="','"/>
         <xsl:value-of select="$nl"/>
          
         <xsl:value-of select="'        &quot;y&quot;: '"/>
         <xsl:value-of select="@y"/>
         <xsl:value-of select="','"/>
         <xsl:value-of select="$nl"/>
           
         <xsl:value-of select="'        &quot;sx&quot;: '"/>
         <xsl:value-of select="@sx"/>
         <xsl:value-of select="','"/>
         <xsl:value-of select="$nl"/>
          
         <xsl:value-of select="'        &quot;x&quot;: '"/>
         <xsl:value-of select="@x"/>
         <xsl:value-of select="$nl"/>
       
         <xsl:if test="position()!= last()">
            <xsl:value-of select="'    }, {'"/>
            <xsl:value-of select="$nl"/>
         </xsl:if>
      </xsl:for-each>
      
      <xsl:value-of select="'    }]'"/>
      <xsl:value-of select="$nl"/>
   </xsl:template>
   
</xsl:stylesheet>
