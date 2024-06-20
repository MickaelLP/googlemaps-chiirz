<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230321075939 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE itinerary ADD fk_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F65741EEB9 FOREIGN KEY (fk_user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_FF2238F65741EEB9 ON itinerary (fk_user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F65741EEB9');
        $this->addSql('DROP INDEX IDX_FF2238F65741EEB9 ON itinerary');
        $this->addSql('ALTER TABLE itinerary DROP fk_user_id');
    }
}
